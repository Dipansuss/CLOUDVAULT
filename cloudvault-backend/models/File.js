const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  savedName: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  iv: { type: String, required: true }, // ✅ THIS LINE IS MISSING
});

module.exports = mongoose.model("File", FileSchema);
