const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const File = require("../models/File");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// Upload file and save metadata
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

  const filePath = `/uploads/${req.file.filename}`;
  const file = new File({
    originalName: req.file.originalname,
    savedName: req.file.filename,
    url: filePath,
    size: req.file.size,
    mimeType: req.file.mimetype,
    uploadedAt: new Date(),
  });

  try {
    await file.save();
    res.json({
      msg: "File uploaded successfully",
      filePath,
      originalName: file.originalName,
      savedName: file.savedName,
      size: file.size,
      mimeType: file.mimeType,
      uploadedAt: file.uploadedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to save file metadata" });
  }
});

// Delete file
router.delete("/delete/:filename", async (req, res) => {
  const savedName = req.params.filename;
  const filepath = path.join(__dirname, "../uploads", savedName);

  try {
    // Delete file from disk
    fs.unlinkSync(filepath);

    // Delete metadata from DB
    await File.deleteOne({ savedName });

    res.json({ msg: "File deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ msg: "Failed to delete file" });
  }
});

// Get all files
router.get("/", async (req, res) => {
  try {
    const files = await File.find().sort({ uploadedAt: -1 });
    const formatted = files.map((file) => ({
      name: file.originalName,
      savedName: file.savedName,
      url: `http://localhost:5000${file.url}`,
      size: `${Math.round(file.size / 1024)} KB`,
      type: file.mimeType.split("/")[1],
      date: new Date(file.uploadedAt).toISOString().split("T")[0],
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch files" });
  }
});

module.exports = router;
