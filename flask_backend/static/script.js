// Hàm hiển thị ảnh gốc ngay sau khi chọn file
document.getElementById('fileInput').addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const originalImage = document.getElementById('originalImage');
        originalImage.src = URL.createObjectURL(file);
        originalImage.style.display = 'block'; // Hiển thị ảnh gốc
    } else {
        alert("No file selected.");
    }
});

// Hàm gửi ảnh đến server và vẽ bounding boxes lên canvas sau khi nhấn "Detect"
function handleDetect() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert("Please select an image first.");
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // Gửi ảnh tới server Flask và nhận JSON chứa bounding boxes
    fetch("http://localhost:5000/detect", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(data => {
        // Hiển thị ảnh gốc và vẽ các bounding box lên canvas
        displayImageWithBoxes(file, data.detections);
    })
    .catch(error => {
        console.error("Error:", error);
        alert(`There was an error with the detection: ${error.message}`);
    });
}

// Hàm hiển thị ảnh gốc và vẽ bounding box lên canvas
function displayImageWithBoxes(file, detections) {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
        // Điều chỉnh kích thước canvas theo kích thước ảnh
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Vẽ ảnh lên canvas
        context.drawImage(img, 0, 0, img.width, img.height);
        
        // Vẽ các bounding box lên ảnh
        detections.forEach(detection => {
            const box = detection.bounding_box;
            const xMin = box.x_min;
            const yMin = box.y_min;
            const xMax = box.x_max;
            const yMax = box.y_max;
            
            // Vẽ hình chữ nhật với tọa độ bounding box
            context.strokeStyle = 'green';
            context.lineWidth = 3;
            context.strokeRect(xMin, yMin, xMax - xMin, yMax - yMin);

            // Vẽ nhãn class_id và confidence với nền trắng
            const label = `${detection.class_name} (${(detection.confidence * 100).toFixed(2)}%)`;
            context.font = '50px Arial';
            context.fillStyle = 'white';
            
            // Tính toán kích thước nhãn
            const textWidth = context.measureText(label).width;
            const textHeight = 50; // Chiều cao của chữ
            
            // Vẽ nền trắng cho nhãn
            const padding = 4; // Khoảng cách giữa nhãn và chữ
            context.fillRect(xMin - padding, (yMin > textHeight ? yMin - textHeight - padding : yMin + padding), textWidth + padding * 2, textHeight + padding);
            
            // Vẽ chữ màu đỏ lên nền trắng
            context.fillStyle = 'red';
            context.fillText(label, xMin, yMin > 20 ? yMin - 10 : yMin + 20);
        });
    };
    function updateURL(event) {
            event.preventDefault();  // Ngăn không cho form gửi theo cách thông thường
            
            var url = document.getElementById("url").value;  // Lấy giá trị từ input
            
            // Gửi yêu cầu AJAX tới server để cập nhật URL
            fetch('/update_url/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'service_url=' + encodeURIComponent(url)
            })
            .then(response => response.json())
            .then(data => {
                // Cập nhật giá trị input với URL mới từ server
                document.getElementById("url").value = data.new_url;
                alert("URL updated to: " + data.new_url);  // Hiển thị thông báo thành công
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    img.src = URL.createObjectURL(file);
}

function updateURL(event) {
    event.preventDefault();  // Ngăn không cho form gửi theo cách thông thường
    
    var url = document.getElementById("url").value;  // Lấy giá trị từ input
    
    // Gửi yêu cầu AJAX tới server để cập nhật URL
    fetch('/update_url/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'service_url=' + encodeURIComponent(url)
    })
    .then(response => response.json())
    .then(data => {
        // Cập nhật giá trị input với URL mới từ server
        document.getElementById("url").value = data.new_url;
        alert("URL updated to: " + data.new_url);  // Hiển thị thông báo thành công
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
