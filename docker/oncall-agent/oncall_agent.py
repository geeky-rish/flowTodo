#!/usr/bin/env python3
"""
On-Call Agent for FlowTodo.
Receives alerts from Alertmanager and takes automated remediation actions.
"""
import asyncio
import json
import logging
import os
import signal
import sys
from datetime import datetime
from typing import Dict, Any, Optional
from dataclasses import dataclass

import httpx
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("oncall-agent")

# Configuration
ONCALL_PORT = int(os.getenv("ONCALL_PORT", "8080"))
BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:8000")
ALERT_WEBHOOK_URL = os.getenv("ALERT_WEBHOOK_URL", "")
DOCKER_COMPOSE_PROJECT = os.getenv("DOCKER_COMPOSE_PROJECT", "flowtodo")


@dataclass
class Alert:
    """Parsed alert from Alertmanager."""
    alertname: str
    severity: str
    status: str  # "firing" or "resolved"
    labels: Dict[str, str]
    annotations: Dict[str, str]
    starts_at: str
    ends_at: Optional[str] = None


class RemediationActions:
    """Automated remediation actions for common alerts."""

    def __init__(self, backend_url: str):
        self.backend_url = backend_url
        self.client = httpx.AsyncClient(timeout=30.0)

    async def restart_service(self, service_name: str) -> bool:
        """Restart a Docker service using docker-compose."""
        try:
            logger.info(f"Attempting to restart service: {service_name}")
            # In a real deployment, this would use Docker API or SSH to the host
            # For now, we'll call a management endpoint on the backend
            response = await self.client.post(
                f"{self.backend_url}/api/admin/restart-service",
                json={"service": service_name}
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Failed to restart service {service_name}: {e}")
            return False

    async def clear_database_connections(self) -> bool:
        """Clear database connection pool."""
        try:
            logger.info("Clearing database connection pool")
            response = await self.client.post(
                f"{self.backend_url}/api/admin/clear-db-pool"
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Failed to clear DB pool: {e}")
            return False

    async def scale_service(self, service_name: str, replicas: int) -> bool:
        """Scale a service (requires Docker Swarm or Kubernetes)."""
        logger.info(f"Scaling {service_name} to {replicas} replicas")
        # This would require orchestration platform integration
        return False

    async def notify_oncall(self, alert: Alert, message: str) -> bool:
        """Send notification to on-call personnel."""
        try:
            if ALERT_WEBHOOK_URL:
                async with httpx.AsyncClient() as client:
                    await client.post(ALERT_WEBHOOK_URL, json={
                        "text": f"🚨 FlowTodo Alert: {alert.alertname}",
                        "blocks": [
                            {"type": "section", "text": {"type": "mrkdwn", "text": f"*Alert:* {alert.alertname}"}},
                            {"type": "section", "text": {"type": "mrkdwn", "text": f"*Severity:* {alert.severity}"}},
                            {"type": "section", "text": {"type": "mrkdwn", "text": f"*Status:* {alert.status}"}},
                            {"type": "section", "text": {"type": "mrkdwn", "text": f"*Description:* {alert.annotations.get('description', 'N/A')}"}},
                            {"type": "section", "text": {"type": "mrkdwn", "text": f"*Action:* {message}"}},
                        ]
                    })
            logger.info(f"Notification sent for alert: {alert.alertname}")
            return True
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")
            return False


class OnCallAgent:
    """Main on-call agent that processes alerts and takes action."""

    def __init__(self):
        self.remediation = RemediationActions(BACKEND_URL)
        self.alert_history: Dict[str, Alert] = {}
        self.action_cooldown: Dict[str, datetime] = {}
        self.cooldown_seconds = 300  # 5 minutes between same actions

    def _should_act(self, alert_name: str) -> bool:
        """Check if enough time has passed since last action for this alert."""
        now = datetime.now()
        last_action = self.action_cooldown.get(alert_name)
        if last_action and (now - last_action).total_seconds() < self.cooldown_seconds:
            return False
        self.action_cooldown[alert_name] = now
        return True

    async def handle_alert(self, alert: Alert) -> Dict[str, Any]:
        """Process an alert and take appropriate action."""
        logger.info(f"Processing alert: {alert.alertname} ({alert.status})")

        # Store in history
        self.alert_history[alert.alertname] = alert

        if alert.status == "resolved":
            logger.info(f"Alert resolved: {alert.alertname}")
            return {"action": "none", "reason": "alert resolved"}

        # Only act on firing alerts
        if alert.status != "firing":
            return {"action": "none", "reason": f"status is {alert.status}"}

        # Check cooldown
        if not self._should_act(alert.alertname):
            return {"action": "none", "reason": "cooldown active"}

        # Route to specific handler
        action_result = await self._route_alert(alert)

        # Always notify
        await self.remediation.notify_oncall(alert, action_result.get("message", "Alert processed"))

        return action_result

    async def _route_alert(self, alert: Alert) -> Dict[str, Any]:
        """Route alert to specific handler based on alert name."""
        alert_name = alert.alertname

        if alert_name == "ServiceDown":
            return await self._handle_service_down(alert)
        elif alert_name == "HighErrorRate":
            return await self._handle_high_error_rate(alert)
        elif alert_name == "HighLatency":
            return await self._handle_high_latency(alert)
        elif alert_name == "DatabaseConnectionFailures":
            return await self._handle_db_connection_failure(alert)
        elif alert_name == "HighDatabaseLatency":
            return await self._handle_high_db_latency(alert)
        elif alert_name == "HighMemoryUsage":
            return await self._handle_high_memory(alert)
        elif alert_name == "HighCPUUsage":
            return await self._handle_high_cpu(alert)
        elif alert_name == "AuthFailureSpike":
            return await self._handle_auth_failure_spike(alert)
        elif alert_name == "TaskOperationFailures":
            return await self._handle_task_failures(alert)
        else:
            return {"action": "notify_only", "message": f"No automated action for {alert_name}"}

    async def _handle_service_down(self, alert: Alert) -> Dict[str, Any]:
        """Handle service down alert."""
        service = alert.labels.get("service", "flowtodo-backend")
        success = await self.remediation.restart_service(service)
        return {
            "action": "restart_service" if success else "notify_only",
            "message": f"Attempted restart of {service}: {'success' if success else 'failed'}"
        }

    async def _handle_high_error_rate(self, alert: Alert) -> Dict[str, Any]:
        """Handle high error rate."""
        # Try restarting backend
        success = await self.remediation.restart_service("flowtodo-backend")
        return {
            "action": "restart_service" if success else "notify_only",
            "message": "Attempted backend restart due to high error rate"
        }

    async def _handle_high_latency(self, alert: Alert) -> Dict[str, Any]:
        """Handle high latency."""
        # Clear DB pool and restart
        await self.remediation.clear_database_connections()
        success = await self.remediation.restart_service("flowtodo-backend")
        return {
            "action": "restart_and_clear_db" if success else "notify_only",
            "message": "Cleared DB pool and restarted backend due to high latency"
        }

    async def _handle_db_connection_failure(self, alert: Alert) -> Dict[str, Any]:
        """Handle database connection failure."""
        success = await self.remediation.clear_database_connections()
        if not success:
            success = await self.remediation.restart_service("flowtodo-backend")
        return {
            "action": "clear_db_pool" if success else "notify_only",
            "message": "Attempted to clear DB connection pool"
        }

    async def _handle_high_db_latency(self, alert: Alert) -> Dict[str, Any]:
        """Handle high database latency."""
        await self.remediation.clear_database_connections()
        return {
            "action": "clear_db_pool",
            "message": "Cleared DB connection pool due to high latency"
        }

    async def _handle_high_memory(self, alert: Alert) -> Dict[str, Any]:
        """Handle high memory usage."""
        success = await self.remediation.restart_service("flowtodo-backend")
        return {
            "action": "restart_service" if success else "notify_only",
            "message": "Restarted backend due to high memory usage"
        }

    async def _handle_high_cpu(self, alert: Alert) -> Dict[str, Any]:
        """Handle high CPU usage."""
        # For CPU, we might want to scale instead of restart
        return {
            "action": "notify_only",
            "message": "High CPU detected - manual investigation needed"
        }

    async def _handle_auth_failure_spike(self, alert: Alert) -> Dict[str, Any]:
        """Handle authentication failure spike."""
        # Could implement IP blocking here
        return {
            "action": "notify_only",
            "message": "Auth failure spike detected - possible brute force attack"
        }

    async def _handle_task_failures(self, alert: Alert) -> Dict[str, Any]:
        """Handle task operation failures."""
        await self.remediation.clear_database_connections()
        success = await self.remediation.restart_service("flowtodo-backend")
        return {
            "action": "restart_and_clear_db" if success else "notify_only",
            "message": "Restarted backend and cleared DB pool due to task failures"
        }


# FastAPI app for receiving webhooks
app = FastAPI(title="FlowTodo On-Call Agent")
agent = OnCallAgent()


@app.post("/webhook")
async def receive_alert(request: Request):
    """Receive alert webhook from Alertmanager."""
    try:
        payload = await request.json()
        logger.info(f"Received webhook: {json.dumps(payload, indent=2)}")

        # Alertmanager sends alerts in a specific format
        alerts = payload.get("alerts", [])
        results = []

        for alert_data in alerts:
            alert = Alert(
                alertname=alert_data.get("labels", {}).get("alertname", "unknown"),
                severity=alert_data.get("labels", {}).get("severity", "warning"),
                status=alert_data.get("status", "firing"),
                labels=alert_data.get("labels", {}),
                annotations=alert_data.get("annotations", {}),
                starts_at=alert_data.get("startsAt", ""),
                ends_at=alert_data.get("endsAt"),
            )
            result = await agent.handle_alert(alert)
            results.append({"alert": alert.alertname, "result": result})

        return JSONResponse({"status": "processed", "results": results})

    except Exception as e:
        logger.error(f"Error processing webhook: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "oncall-agent"}


@app.get("/alerts/history")
async def alert_history():
    """Get alert history."""
    return {
        "alerts": [
            {
                "alertname": a.alertname,
                "severity": a.severity,
                "status": a.status,
                "starts_at": a.starts_at,
            }
            for a in agent.alert_history.values()
        ]
    }


def main():
    """Run the on-call agent server."""
    logger.info(f"Starting On-Call Agent on port {ONCALL_PORT}")
    uvicorn.run(app, host="0.0.0.0", port=ONCALL_PORT)


if __name__ == "__main__":
    main()