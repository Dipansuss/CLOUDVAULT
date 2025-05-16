import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  // 🔐 Redirect to login if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  // ⬇️ Load all files from backend
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/files");
        setFiles(res.data);
      } catch (err) {
        console.error("Failed to fetch files", err);
      }
    };
    fetchFiles();
  }, []);

  // ⬆️ Upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/files/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            const percent = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(percent);
          },
        }
      );

      const uploaded = res.data;
      const newFile = {
        name: uploaded.originalName,
        savedName: uploaded.savedName,
        url: `http://localhost:5000${uploaded.filePath}`,
        size: `${Math.round(uploaded.size / 1024)} KB`,
        type: uploaded.mimeType.split("/")[1],
        date: new Date(uploaded.uploadedAt).toISOString().split("T")[0],
      };

      setFiles((prev) => [newFile, ...prev]);
      setUploadProgress(0);
    } catch (err) {
      console.error("Upload error:", err.message || err);
      alert("Upload failed!");
    }

    e.target.value = null;
  };

  // 📥 Download
  const handleDownload = (url) => {
    window.open(url, "_blank");
  };

  // ❌ Delete
  const handleDelete = async (savedName, index) => {
    try {
      await axios.delete(`http://localhost:5000/api/files/delete/${savedName}`);
      setFiles((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      alert("Failed to delete file");
    }
  };

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="logo">CloudVault Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="upload-section">
        <label htmlFor="upload-input" className="upload-btn">
          Upload File
        </label>
        <input
          type="file"
          id="upload-input"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
        {uploadProgress > 0 && <p>Uploading: {uploadProgress}%</p>}
      </div>

      <div className="file-list">
        {files.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          files.map((file, idx) => (
            <div key={idx} className="file-item">
              <h3>{file.name}</h3>
              <p>Type: {file.type}</p>
              <p>Size: {file.size}</p>
              <p>Date: {file.date}</p>
              <button onClick={() => handleDownload(file.url)}>Download</button>
              <button onClick={() => handleDelete(file.savedName, idx)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
