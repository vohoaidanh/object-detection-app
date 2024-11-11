import io
from app.model.yolo_model import detect_objects_yolo

def detect_objects_from_image(image_bytes: bytes):
    """
    Nhận ảnh dưới dạng byte và gọi model YOLO để phát hiện đối tượng.
    """
    image = io.BytesIO(image_bytes)
    detections = detect_objects_yolo(image)
    return detections
