from fastapi import FastAPI

from app.core.database import test_connection
from app.routers import notes, tasks, auth

app = FastAPI(
    title="Zenith API",
    description="Note-taking and task management API",
    version="0.1.0",
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
