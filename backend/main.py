from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth, audio, video, image, converter, socials, music_recognition

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Daily Life Tools API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(audio.router, prefix="/api/v1/audio", tags=["audio"])
app.include_router(video.router, prefix="/api/v1/video", tags=["video"])
app.include_router(image.router, prefix="/api/v1/image", tags=["image"])
app.include_router(converter.router, prefix="/api/v1/converter", tags=["converter"])
app.include_router(socials.router, prefix="/api/v1/socials", tags=["socials"])
app.include_router(music_recognition.router, prefix="/api/v1/music-id", tags=["music-recognition"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Daily Life Tools API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
