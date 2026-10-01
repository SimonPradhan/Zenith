from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.rate_limit import limiter
from app.core.database import test_connection
from app.routers import notes, tasks, auth

app = FastAPI(
    title="Zenith API",
    description="Note-taking and task management API",
    version="0.1.0",
)

app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        settings.frontend_url,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(notes.router)
app.include_router(tasks.router)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "zenith-api",
    }

@app.get("/db-test")
def database_test():
    result = test_connection()

    return {
        "status": "ok",
        "database": "connected",
        "test_result": result,
    }
