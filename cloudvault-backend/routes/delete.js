const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.delete('/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../uploads', filename);

  fs.unlink(filepath, (err) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ msg: 'Failed to delete file' });
    }
    res.json({ msg: 'File deleted successfully' });
  });
});

module.exports = router;
