"""
Admin endpoints for on-call agent remediation actions.
These endpoints are protected and only accessible by the on-call agent.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import Optional

from app.database.connection import get_db, close_mongo_connection, connect_to_mongo
from app.core.config import get_settings

router = APIRouter(prefix="/api/admin", tags=["admin"])
logger = logging.getLogger(__name__)
settings = get_settings()


async def verify_admin_token(x_admin_token: Optional[str] = Header(None)):
    """Verify admin token for on-call agent."""
    admin_token = settings.ADMIN_TOKEN
    if not admin_token:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin token not configured"
        )
    if x_admin_token != admin_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin token"
        )
    return True


@router.post("/restart-service")
async def restart_service(
    service: str,
    authorized: bool = Depends(verify_admin_token)
):
    """
    Restart a service.
    In a real deployment, this would trigger a Docker service restart.
    For now, we'll just log the request and return success.
    """
    logger.info(f"Admin request to restart service: {service}")

    # In a production setup with Docker Swarm/Kubernetes, this would:
    # 1. Call Docker API to restart the service
    # 2. Or call Kubernetes API to rollout restart
    # 3. Or send a signal to the process manager

    # For this implementation, we'll simulate by reconnecting to MongoDB
    if service in ["flowtodo-backend", "backend"]:
        try:
            await close_mongo_connection()
            await connect_to_mongo()
            logger.info("MongoDB connection refreshed")
        except Exception as e:
            logger.error(f"Failed to refresh MongoDB connection: {e}")
            raise HTTPException(status_code=500, detail="Failed to refresh connections")

    return {"status": "success", "service": service, "message": f"Service {service} restart initiated"}


@router.post("/clear-db-pool")
async def clear_db_pool(authorized: bool = Depends(verify_admin_token)):
    """Clear database connection pool by reconnecting."""
    logger.info("Admin request to clear database connection pool")

    try:
        await close_mongo_connection()
        await connect_to_mongo()
        logger.info("Database connection pool cleared and reconnected")
    except Exception as e:
        logger.error(f"Failed to clear DB pool: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear database pool")

    return {"status": "success", "message": "Database connection pool cleared"}


@router.get("/health")
async def admin_health(authorized: bool = Depends(verify_admin_token)):
    """Admin health check."""
    return {"status": "healthy", "service": "flowtodo-admin"}