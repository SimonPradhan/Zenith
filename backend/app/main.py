from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import test_connection
from app.routers import notes, tasks, auth

app = FastAPI(
    title="Zenith API",
    description="Note-taking and task management API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
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
