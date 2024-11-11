import torch
import onnx
from PIL import Image
from io import BytesIO
from ultralytics import YOLO
from pathlib import Path

# Tải model YOLOv8
#model = torch.hub.load('ultralytics/yolov8', 'yolov8')
model = YOLO('app/model/weights/yolo11n.pt')

# Export the model to ONNX format
model.export(format="onnx")  # creates 'yolo11n.onnx'

# Load the exported ONNX model
onnx_model = YOLO("app/model/weights/yolo11n.onnx")

# Run inference
results = onnx_model("https://ultralytics.com/images/bus.jpg")