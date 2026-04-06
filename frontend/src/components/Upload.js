import React, { useState, useRef, useCallback } from "react";
import "./Upload.css";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://leporine-overtender-etha.ngrok-free.dev/predict",
        { method: "POST", body: formData }
      );
      const blob = await response.blob();
      setResult(URL.createObjectURL(blob));
    } catch (error) {
      console.error(error);
      alert("Backend error — check your connection.");
    }

    setLoading(false);
  };

  return (
    <div className="upload-page">
      {/* ── Header ── */}
      <header className="upload-header">
        <p className="tag">// Neural Vision System v2.0</p>
        <h1>PREDICT</h1>
        <p>Upload an image — let the model see</p>
      </header>

      {/* ── Upload Card ── */}
      <div className="upload-card">
        {/* Drop Zone */}
        <div
          className={`drop-zone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            className="file-input-hidden"
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files[0])}
            onClick={(e) => e.stopPropagation()}
          />

          <div className="corner-br" />

          <div className="upload-icon-wrap">
            <div className="upload-icon">
              <div className="upload-icon-ring" />
              <div className="upload-icon-ring" />
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
          </div>

          <p className="drop-text-primary">
            {dragging ? "Release to load" : "Drop image here"}
          </p>
          <p className="drop-text-secondary">or click to browse — PNG, JPG, WEBP</p>
        </div>

        {/* File Info */}
        {file && (
          <div className="file-info">
            <span className="file-info-icon">🖼</span>
            <span className="file-info-name">{file.name}</span>
            <button
              className="file-info-remove"
              onClick={() => { setFile(null); setPreview(null); setResult(null); }}
              title="Remove"
            >×</button>
          </div>
        )}

        {/* Preview Thumbnail */}
        {preview && (
          <div className="preview-thumb">
            <span className="preview-thumb-label">Input</span>
            <img src={preview} alt="preview" />
          </div>
        )}

        {/* Predict Button */}
        <button
          className={`predict-btn ${loading ? "loading" : ""}`}
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? "[ Processing... ]" : "[ Run Prediction ]"}
        </button>

        {/* Loading Bar */}
        {loading && (
          <>
            <div className="loading-bar-wrap">
              <div className="loading-bar" />
            </div>
            <p className="loading-status">Analyzing image data</p>
          </>
        )}
      </div>

      {/* ── Result ── */}
      {result && (
        <div className="result-section">
          <div className="result-header">
            <div className="result-header-line" />
            <h3>Output</h3>
            <div className="result-header-line right" />
          </div>

          <div className="result-image-wrap">
            <img src={result} alt="prediction result" />
            <span className="result-badge">Prediction Complete</span>
          </div>

          <a
            className="download-btn"
            href={result}
            download="prediction_result.png"
          >
            [ Download Result ]
          </a>
        </div>
      )}

      <footer className="upload-footer">
        Neural Vision System &mdash; Powered by AI
      </footer>
    </div>
  );
};

export default Upload;