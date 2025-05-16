const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  savedName: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true }, // store size in bytes
  mimeType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("File", FileSchema);
