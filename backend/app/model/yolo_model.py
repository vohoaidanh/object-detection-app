import torch
from PIL import Image
from io import BytesIO
from ultralytics import YOLO

# Tải model YOLOv8
#model = torch.hub.load('ultralytics/yolov8', 'yolov8')
model = YOLO('app/model/weights/yolo11n.pt')
#model = YOLO("app/model/weights/yolo11n.onnx")

# Kiểm tra nếu CUDA khả dụng, nếu không thì dùng CPU
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model.to(device)

class_names = model.names

def detect_objects_yolo(image_bytes: BytesIO):
    """
    Sử dụng YOLOv8 để phát hiện đối tượng trong ảnh.
    """
    image = Image.open(image_bytes)
    results = model(image, task='detect')[0]  # Nhận kết quả từ YOLOv8
    # Lấy danh sách tên lớp từ mô hình
    
    # Lấy bounding box dưới dạng dictionary
    bounding_boxes = []
    
    for result in results:
        box = result.boxes
        x_min, y_min, x_max, y_max = map(int, box.xyxy[0].tolist())  # Lấy tọa độ dưới dạng integer
        confidence = float(box.conf[0])
        class_id = int(box.cls[0])
        class_name = class_names[class_id] if class_id in class_names else f"Unknown ({class_id})"

        bounding_boxes.append({
            "class_name": class_name,  # Sử dụng class_name thay vì class_id
            "confidence": confidence,
            "bounding_box": {
                "x_min": x_min,
                "y_min": y_min,
                "x_max": x_max,
                "y_max": y_max
            }
        })
    print(len(results))
    print(100*'*')
    return bounding_boxes

