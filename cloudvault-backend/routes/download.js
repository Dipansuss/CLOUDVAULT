const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const File = require("../models/File");

const router = express.Router();

const secretKey = process.env.AES_SECRET_KEY;
const uploadDir = path.join(__dirname, "../uploads");

if (!secretKey || secretKey.length !== 32) {
  console.error("AES_SECRET_KEY must be set in .env and be 32 characters long");
  process.exit(1);
}

const decryptFileBuffer = (buffer, ivHex) => {
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey),
    iv
  );
  const decrypted = Buffer.concat([decipher.update(buffer), decipher.final()]);
  return decrypted;
};

router.get("/:filename", async (req, res) => {
  const savedName = req.params.filename;

  try {
    const fileDoc = await File.findOne({ savedName });
    console.log("Downloading file doc:", fileDoc);

    if (!fileDoc) return res.status(404).json({ msg: "File not found" });
    if (!fileDoc.iv)
      return res.status(500).json({ msg: "Missing IV for decryption" });

    const filePath = path.join(uploadDir, savedName);
    const encryptedBuffer = fs.readFileSync(filePath);
    const decryptedBuffer = decryptFileBuffer(encryptedBuffer, fileDoc.iv);

    res.set({
      "Content-Disposition": `attachment; filename="${fileDoc.originalName}"`,
      "Content-Type": fileDoc.mimeType,
      "Content-Length": decryptedBuffer.length,
    });

    res.send(decryptedBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to decrypt and download file" });
  }
});

module.exports = router;
