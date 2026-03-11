from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.api.database import init_db
from app.api.controllers.auth_controller import router as auth_router
from app.api.controllers.admin_controller import router as admin_router
from app.api.controllers.user_controller import router as user_router


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Initialize database on startup"""
    init_db()
    yield


app = FastAPI(
    title="SHG Bank System",
    description="Self Help Group Banking and Loan Management System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files and templates
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")
templates = Jinja2Templates(directory="frontend/templates")

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin_router, tags=["Admin"])
app.include_router(user_router, prefix="/api/user", tags=["User"])

@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
