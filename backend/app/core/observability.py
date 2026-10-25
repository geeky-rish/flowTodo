"""
Observability module for FlowTodo.
Provides structured logging, metrics, and distributed tracing.
"""
import os
import sys
import logging
import structlog
from typing import Optional
from contextvars import ContextVar

from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.pymongo import PymongoInstrumentor
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from opentelemetry.propagate import set_global_textmap
from prometheus_client import Counter, Histogram, Gauge, start_http_server

from app.core.config import get_settings

settings = get_settings()

# Context variable for trace ID
trace_id_var: ContextVar[Optional[str]] = ContextVar("trace_id", default=None)

# Prometheus metrics
REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status_code"]
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "endpoint"]
)

ACTIVE_REQUESTS = Gauge(
    "http_requests_active",
    "Active HTTP requests",
    ["method", "endpoint"]
)

DB_QUERY_COUNT = Counter(
    "db_queries_total",
    "Total database queries",
    ["operation", "collection"]
)

DB_QUERY_LATENCY = Histogram(
    "db_query_duration_seconds",
    "Database query latency in seconds",
    ["operation", "collection"]
)

TASK_OPERATIONS = Counter(
    "task_operations_total",
    "Total task operations",
    ["operation", "status"]
)

USER_REGISTRATIONS = Counter(
    "user_registrations_total",
    "Total user registrations"
)

USER_LOGINS = Counter(
    "user_logins_total",
    "Total user logins",
    ["success"]
)


def get_trace_id() -> Optional[str]:
    """Get current trace ID from context."""
    return trace_id_var.get()


def set_trace_id(trace_id: str) -> None:
    """Set trace ID in context."""
    trace_id_var.set(trace_id)


def clear_trace_id() -> None:
    """Clear trace ID from context."""
    trace_id_var.set(None)


def configure_structlog() -> None:
    """Configure structlog for structured JSON logging."""

    def add_trace_id(logger, method_name, event_dict):
        """Add trace ID to log entries."""
        trace_id = get_trace_id()
        if trace_id:
            event_dict["trace_id"] = trace_id
        return event_dict

    def add_service_info(logger, method_name, event_dict):
        """Add service info to log entries."""
        event_dict["service"] = "flowtodo-api"
        event_dict["version"] = settings.APP_VERSION
        return event_dict

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            add_trace_id,
            add_service_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.INFO,
    )


def setup_tracing() -> trace.Tracer:
    """Set up OpenTelemetry tracing."""

    # Create tracer provider
    tracer_provider = TracerProvider()

    # Configure exporter based on environment
    otlp_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
    if otlp_endpoint:
        # Production: export to OTLP endpoint (e.g., Jaeger, Tempo, Grafana Cloud)
        span_exporter = OTLPSpanExporter(endpoint=otlp_endpoint, insecure=True)
    else:
        # Development: export to console
        span_exporter = ConsoleSpanExporter()

    tracer_provider.add_span_processor(BatchSpanProcessor(span_exporter))
    trace.set_tracer_provider(tracer_provider)

    # Set up trace context propagation
    set_global_textmap(TraceContextTextMapPropagator())

    return trace.get_tracer(__name__)


def setup_metrics() -> metrics.Meter:
    """Set up OpenTelemetry metrics with Prometheus exporter."""

    # Prometheus metric reader for /metrics endpoint
    prometheus_reader = PrometheusMetricReader()

    # OTLP metric reader for production
    otlp_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
    readers = [prometheus_reader]

    if otlp_endpoint:
        otlp_reader = PeriodicExportingMetricReader(
            OTLPMetricExporter(endpoint=otlp_endpoint, insecure=True),
            export_interval_millis=30000,
        )
        readers.append(otlp_reader)

    meter_provider = MeterProvider(metric_readers=readers)
    metrics.set_meter_provider(meter_provider)

    return metrics.get_meter(__name__)


def instrument_app(app) -> None:
    """Instrument FastAPI app with OpenTelemetry."""
    FastAPIInstrumentor.instrument_app(
        app,
        tracer_provider=trace.get_tracer_provider(),
        meter_provider=metrics.get_meter_provider(),
    )

    # Instrument HTTPX for outgoing requests
    HTTPXClientInstrumentor().instrument()

    # Instrument PyMongo for database queries
    PymongoInstrumentor().instrument()


def start_prometheus_server(port: int = 9090) -> None:
    """Start Prometheus metrics HTTP server."""
    try:
        start_http_server(port)
        structlog.get_logger().info("Prometheus metrics server started", port=port)
    except Exception as e:
        structlog.get_logger().warning("Failed to start Prometheus server", error=str(e))


# Initialize observability
configure_structlog()
tracer = setup_tracing()
meter = setup_metrics()

# Get logger instance
logger = structlog.get_logger()


class TraceIDMiddleware:
    """Middleware to extract/inject trace IDs."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        # Extract trace ID from headers
        trace_id = None
        for header_name, header_value in scope.get("headers", []):
            if header_name.decode().lower() == "traceparent":
                # Parse traceparent header: version-trace-id-parent-id-flags
                parts = header_value.decode().split("-")
                if len(parts) >= 2:
                    trace_id = parts[1]
                break

        # Set trace ID in context
        if trace_id:
            set_trace_id(trace_id)

        # Add trace ID to response headers
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                current_trace_id = get_trace_id()
                if current_trace_id:
                    headers = list(message.get("headers", []))
                    headers.append((b"x-trace-id", current_trace_id.encode()))
                    message["headers"] = headers
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        finally:
            clear_trace_id()


def record_request_metrics(method: str, endpoint: str, status_code: int, duration: float) -> None:
    """Record HTTP request metrics."""
    REQUEST_COUNT.labels(method=method, endpoint=endpoint, status_code=status_code).inc()
    REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(duration)


def record_db_metrics(operation: str, collection: str, duration: float) -> None:
    """Record database query metrics."""
    DB_QUERY_COUNT.labels(operation=operation, collection=collection).inc()
    DB_QUERY_LATENCY.labels(operation=operation, collection=collection).observe(duration)


def record_task_operation(operation: str, status: str) -> None:
    """Record task operation metrics."""
    TASK_OPERATIONS.labels(operation=operation, status=status).inc()


def record_user_registration() -> None:
    """Record user registration metric."""
    USER_REGISTRATIONS.inc()


def record_user_login(success: bool) -> None:
    """Record user login metric."""
    USER_LOGINS.labels(success=str(success).lower()).inc()