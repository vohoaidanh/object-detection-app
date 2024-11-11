from fastapi import FastAPI
from app.api import object_detection

app = FastAPI()

app.include_router(object_detection.router, prefix="/api", tags=["Object Detection"])

if __name__ == "__main__":
    #uvicorn run:app --reload
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
