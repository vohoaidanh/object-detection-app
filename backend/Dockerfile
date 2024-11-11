#docker build -t yolo-fastapi-app .
# Sử dụng Python 3.9 trở lên
FROM python:3.10

# Thêm dòng này vào Dockerfile trước khi bạn cài đặt các gói khác
RUN apt-get update && apt-get install -y libgl1

# Đặt thư mục làm việc trong container
WORKDIR /app

# Sao chép các file cần thiết vào container
COPY requirements.txt /app

# Cài đặt các thư viện cần thiết
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép toàn bộ mã nguồn vào thư mục /app trong container
COPY . /app

# Mở cổng 8000 để truy cập API
EXPOSE 8000

# Lệnh chạy ứng dụng
CMD ["python", "run.py"]
