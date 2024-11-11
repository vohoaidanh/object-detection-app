from fastapi import APIRouter, UploadFile, File
from app.services.detection_service import detect_objects_from_image
from pydantic import BaseModel
from typing import List

router = APIRouter()

class BoundingBox(BaseModel):
    x_min: int
    y_min: int
    x_max: int
    y_max: int

class DetectionResult(BaseModel):
    class_name: str
    confidence: float
    bounding_box: BoundingBox
           
@router.post("/detect/")
async def detect_objects(file: UploadFile = File(...)):
    """
    Nhận ảnh từ frontend và trả về các đối tượng phát hiện được.
    """
    image = await file.read()  # Đọc ảnh gửi lên
    result = detect_objects_from_image(image)
    return {"detections": result}
