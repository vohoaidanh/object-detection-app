# flask_backend/app.py
from flask import Flask, request, jsonify, render_template, redirect, url_for
import requests
from config import MODEL_SERVICE_URL
from flask_cors import CORS  # Thêm thư viện CORS

app = Flask(__name__)
CORS(app)  # Kích hoạt CORS cho toàn bộ ứng dụng

# @app.before_request
# def check_user_agent():
#     user_agent = request.headers.get('User-Agent', '')
#     # Đảm bảo yêu cầu đến từ trình duyệt hoặc một user agent hợp lệ
#     if 'Mozilla' not in user_agent:  # Các trình duyệt đều có "Mozilla" trong User-Agent
#         return jsonify({"error": "API không cho phép yêu cầu từ bot!"}), 403

@app.route('/')  # Route cho trang chủ
def index():
    return render_template('index.html')  # Hiển thị file index.html từ thư mục templates


@app.route('/detect', methods=['POST'])
def detect():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    # Lấy file từ request
    file = request.files['file']
    
    # Gửi file tới FastAPI detection service
    try:
        response = requests.post(MODEL_SERVICE_URL, files={'file': file.read()})

        if response.status_code == 200:
            result_data = response.json()
            #print("Received from FastAPI:", result_data)  # In ra để kiểm tra phản hồi
            return jsonify(result_data)  # Trả về kết quả từ detection service cho frontend
        else:
            return jsonify({"error": "Failed to get a response from detection service"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Route cho trang camera
@app.route('/camera')
def camera():
    return render_template('camera.html')  # Đảm bảo rằng camera.html tồn tại trong thư mục templates


# Folder để lưu ảnh đã upload
import os
import base64
from PIL import Image
from io import BytesIO
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload_frame', methods=['POST'])
def upload_frame():
    if 'image' not in request.form:
        return jsonify({"error": "No image found in the request"}), 400

    image_data = request.form['image']
    
    # Làm sạch dữ liệu base64 (xóa phần header của base64)
    image_data = image_data.split(",")[1]
    
    try:
        # Chuyển đổi base64 thành ảnh
        img_data = base64.b64decode(image_data)
        image = Image.open(BytesIO(img_data))

        # Lưu ảnh vào file
        #image_filename = os.path.join(UPLOAD_FOLDER, "frame.jpg")
        #image.save(image_filename)

        image_bytes = BytesIO()
        image.save(image_bytes, format='JPEG')  # Hoặc 'PNG', tùy thuộc vào định dạng ảnh bạn muốn
        image_bytes.seek(0)  # Reset lại vị trí của stream sau khi ghi

        # Gửi ảnh tới Model API (FastAPI)
        files = {'file': image_bytes}
        try:
            response = requests.post(MODEL_SERVICE_URL, files=files)
            if response.status_code == 200:
                result_data = response.json()
                print("Received from FastAPI:", result_data)  # In ra để kiểm tra phản hồi
                return jsonify(result_data)  # Trả về kết quả từ detection service cho frontend
            else:
                return jsonify({"error": "Failed to get a response from detection service"}), 500
        except requests.exceptions.RequestException as e:
            return jsonify({"error": f"Error while calling model service: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.post("/update_url/")
def update_url():
    global MODEL_SERVICE_URL

    MODEL_SERVICE_URL = request.form.get("service_url")
    return jsonify({"new_url": MODEL_SERVICE_URL})

if __name__ == '__main__':
    #waitress-serve --port=5000 app:app
    #app.run(port=5000, debug=True)
    from waitress import serve
    serve(app, host='0.0.0.0', port=5000)

