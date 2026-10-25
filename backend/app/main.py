import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

from app.core.config import get_settings
from app.core.observability import (
    logger,
    instrument_app,
    TraceIDMiddleware,
    record_request_metrics,
    start_prometheus_server,
    ACTIVE_REQUESTS,
)
from app.database.connection import connect_to_mongo, close_mongo_connection
from app.api import tasks, categories, stats, auth, admin

logging.basicConfig(level=logging.INFO)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    logger.info("Starting up FlowTodo API...")
    await connect_to_mongo()

    # Start Prometheus metrics server in background
    if settings.DEBUG:
        start_prometheus_server(9090)

    logger.info("FlowTodo API ready.")
    yield
    logger.info("Shutting down FlowTodo API...")
    await close_mongo_connection()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Observability Middleware ──────────────────────────────────────────────────
app.add_middleware(TraceIDMiddleware)

# ── Request Metrics Middleware ────────────────────────────────────────────────
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    method = request.method
    # Normalize endpoint path for metrics (replace path params with placeholders)
    endpoint = request.url.path

    # Track active requests
    ACTIVE_REQUESTS.labels(method=method, endpoint=endpoint).inc()

    try:
        response: Response = await call_next(request)
        duration = time.time() - start_time
        record_request_metrics(method, endpoint, response.status_code, duration)
        return response
    except Exception as e:
        duration = time.time() - start_time
        record_request_metrics(method, endpoint, 500, duration)
        raise
    finally:
        ACTIVE_REQUESTS.labels(method=method, endpoint=endpoint).dec()


# ── Exception Handlers ────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."},
    )


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "flowtodo-api",
        "version": settings.APP_VERSION,
    }


@app.get("/metrics", tags=["observability"])
async def metrics_endpoint():
    """Prometheus metrics endpoint."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


app.include_router(tasks.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

# ── Instrument with OpenTelemetry ─────────────────────────────────────────────
instrument_app(app)