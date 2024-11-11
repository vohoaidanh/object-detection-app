import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [image, setImage] = useState(null);
  const [detections, setDetections] = useState([]);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('file', image);

    try {
      const response = await axios.post('http://localhost:8000/api/detect/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setDetections(response.data.detections);
    } catch (error) {
      console.error("Error detecting objects:", error);
    }
  };

  return (
    <div>
      <h1>Object Detection</h1>
      <input type="file" onChange={handleImageChange} />
      <button onClick={handleSubmit}>Detect</button>
      <div>
        {detections.length > 0 && (
          <ul>
            {detections.map((detection, index) => (
              <li key={index}>{detection.class}: {detection.confidence}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;
