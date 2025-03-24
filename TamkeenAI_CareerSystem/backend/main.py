from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import user_routes, career_routes
import uvicorn

app = FastAPI(
    title="TamkeenAI Career System",
    description="API for career guidance and development",
    version="1.0.0"
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_routes.router)
app.include_router(career_routes.router)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to TamkeenAI Career System API",
        "docs": "/docs",
        "redoc": "/redoc"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 