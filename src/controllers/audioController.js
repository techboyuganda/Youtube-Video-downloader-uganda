// Audio download controller
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  isValidYouTubeUrl,
  sanitizeFilename,
  ensureDownloadsDir,
  checkYtDlp,
  DOWNLOADS_DIR
} = require('../utils/downloadUtils');
const {
  createStatus,
  updateStatus,
  completeStatus,
  errorStatus,
  generateDownloadId
} = require('../utils/statusTracker');

// Audio format mapping
const audioFormats = {
  mp3: 'mp3',
  m4a: 'm4a',
  wav: 'wav',
  opus: 'opus'
};

// Download audio
async function downloadAudio(req, res) {
  const { url, format = 'mp3', bitrate = '192' } = req.body;

  // Validate input
  if (!url || !isValidYouTubeUrl(url)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid YouTube URL',
      data: null
    });
  }

  if (!audioFormats[format]) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid audio format',
      data: null
    });
  }

  const downloadId = generateDownloadId();

  try {
    ensureDownloadsDir();

    // Check if yt-dlp is available
    if (!checkYtDlp()) {
      throw new Error('yt-dlp is not installed. Install with: npm install -g yt-dlp');
    }

    // Create status tracking
    createStatus(downloadId);
    updateStatus(downloadId, {
      status: 'downloading',
      message: 'Starting audio extraction...'
    });

    // Prepare download
    const outputTemplate = path.join(DOWNLOADS_DIR, '%(title)s.%(ext)s');

    // Build yt-dlp command for audio extraction
    const command = `yt-dlp -x --audio-format ${format} --audio-quality ${bitrate}K -o "${outputTemplate}" "${url}"`;

    updateStatus(downloadId, {
      progress: 50,
      message: 'Extracting audio...'
    });

    execSync(command, { stdio: 'pipe' });

    updateStatus(downloadId, {
      progress: 90,
      message: 'Processing...'
    });

    // Find downloaded file
    const files = fs.readdirSync(DOWNLOADS_DIR);
    const audioFile = files.find(f => f.endsWith(`.${format}`));

    if (!audioFile) {
      throw new Error('Download completed but file not found');
    }

    const filename = sanitizeFilename(audioFile);
    const fileSize = fs.statSync(path.join(DOWNLOADS_DIR, audioFile)).size;

    completeStatus(downloadId, [{
      filename,
      size: fileSize
    }]);

    res.json({
      status: 'success',
      message: 'Audio extracted successfully',
      data: {
        downloadId,
        filename,
        size: fileSize,
        format,
        bitrate,
        url: `/downloads/${filename}`
      }
    });

  } catch (error) {
    errorStatus(downloadId, error.message);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Audio extraction failed',
      data: null
    });
  }
}

module.exports = {
  downloadAudio
};
