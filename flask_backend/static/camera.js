
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureCanvas = document.getElementById('captureCanvas');
const context_capture = captureCanvas.getContext('2d');
const context_draw = canvas.getContext('2d');

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const responseBox = document.getElementById('responseBox');

let stream;
let intervalId;  // Lưu ID của setInterval
let imageCounter = 0;  // Biến đếm toàn cục để theo dõi số lần captureFrame được gọi

// Hàm bắt đầu camera
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        startButton.disabled = true;
        stopButton.disabled = false;

        // Bắt đầu gửi frame mỗi giây
        intervalId = setInterval(captureFrame, 40);  // Chụp mỗi 1 giây
    } catch (err) {
        console.error("Error accessing camera: ", err);
    }
}

// Hàm dừng camera
function stopCamera() {
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
        startButton.disabled = false;
        stopButton.disabled = true;

        // Dừng việc gọi captureFrame mỗi giây
        clearInterval(intervalId);  
        intervalId = null; // Đặt intervalId về null để tránh các lần gọi lại ngoài ý muốn
        
    }
}

// Chụp frame từ video và gửi lên server
let  detections  = []
async function captureFrame() {
        // Tăng biến đếm và log số lần capture
    imageCounter++;
    //console.log("Image No.", imageCounter);
    context_capture.drawImage(video, 0, 0, canvas.width, canvas.height);
    //const imageData = captureCanvas.toDataURL('image/jpeg'); // Convert frame to base64 JPEG
    // Nén ảnh trước khi gửi lên server
    const options = {
        maxSizeMB: 0.2,           // Giới hạn kích thước file (MB)
        maxWidthOrHeight: 320, // Giới hạn chiều rộng hoặc chiều cao (px)
        useWebWorker: true      // Dùng web worker để nén nhanh hơn
    };
    try {
        // Nén ảnh
        const compressedFile = await imageCompression.canvasToFile(captureCanvas, 'image/jpeg', 'captured_image.jpg', Date.now(), 0.5);

        //const compressedFile = await imageCompression.canvasToFile(imageData, options);
        console.log("Compressed image size (in bytes):", compressedFile.size);

        // Chuyển file nén thành base64
        const compressedImageData = await imageCompression.getDataUrlFromFile(compressedFile);

        // Gửi ảnh nén lên server
        detections = await sendFrameToServer(compressedImageData);

        // Hiển thị kết quả lên giao diện
        responseBox.value = JSON.stringify(detections, null, 2);
    } catch (error) {
        console.error("Error during image compression:", error);
    }

    //detections = await sendFrameToServer(imageData);
    //responseBox.value = JSON.stringify(detections, null, 2);
}


// Gửi frame đến server
async function sendFrameToServer(imageData) {
    const formData = new FormData();
    formData.append("image", imageData);

    try {
        const response = await fetch("/upload_frame", {
            method: "POST",
            body: formData
        });
        const result = await response.json();
        console.log(result);
        return result.detections || [];  // Giả sử server trả về danh sách bounding boxes trong 'detections'

    } catch (error) {
        console.error("Error sending frame to server: ", error);
        return [];  // Trả về mảng rỗng nếu có lỗi

    }
}

// Chức năng vẽ bounding box lên video
function drawBoundingBoxes() {
    // Xóa canvas trước khi vẽ
    context_draw.clearRect(0, 0, canvas.width, canvas.height);
    // Đặt màu sắc và độ dày cho bounding box
    context_draw.strokeStyle = 'red';
    context_draw.lineWidth = 3;
    context_draw.font = '16px Arial';
    context_draw.fillStyle = 'red';

    // Vẽ từng bounding box và thông tin trong detections
    detections.forEach(obj => {
        const { class_name, confidence, bounding_box: box } = obj;

        // Vẽ bounding box
        context_draw.beginPath();
        context_draw.rect(box.x_min, box.y_min, box.x_max - box.x_min, box.y_max - box.y_min);
        context_draw.stroke();

        // Vẽ thông tin class_name và confidence
        const label = `${class_name} (${(confidence * 100).toFixed(1)}%)`;
        context_draw.fillText(label, box.x_min, box.y_min - 5); // Vẽ nhãn ngay trên bounding box
    });
}


    // Update bounding box and video frame every frame
video.addEventListener('play', () => {
    function update() {
        if (!video.paused && !video.ended) {
            drawBoundingBoxes();
            requestAnimationFrame(update);
            //console.log("drawBoundingBoxes");
        }
    }
    update();
    });


    
// Bắt đầu và dừng camera
startButton.addEventListener('click', startCamera);
stopButton.addEventListener('click', stopCamera);