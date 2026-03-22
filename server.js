const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// Serve downloads directory
app.use('/downloads', express.static(DOWNLOADS_DIR));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.post('/api/download/video', require('./src/routes/videoRoutes').downloadVideo);
app.post('/api/download/playlist', require('./src/routes/playlistRoutes').downloadPlaylist);
app.post('/api/download/audio', require('./src/routes/audioRoutes').downloadAudio);
app.get('/api/info', require('./src/routes/infoRoutes').getVideoInfo);
app.get('/api/status/:id', require('./src/routes/statusRoutes').getDownloadStatus);

// Download file endpoint
app.get('/api/downloads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(DOWNLOADS_DIR, filename);

  // Security: prevent directory traversal
  if (!path.resolve(filepath).startsWith(path.resolve(DOWNLOADS_DIR))) {
    return res.status(403).json({ status: 'error', message: 'Access denied' });
  }

  // Check if file exists
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ status: 'error', message: 'File not found' });
  }

  res.download(filepath);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    data: null
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`YouTube Downloader running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop the server`);
});

module.exports = app;
