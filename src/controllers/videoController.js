// Video download controller
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  isValidYouTubeUrl,
  sanitizeFilename,
  ensureDownloadsDir,
  checkYtDlp,
  getFormatCode,
  DOWNLOADS_DIR
} = require('../utils/downloadUtils');
const {
  createStatus,
  updateStatus,
  completeStatus,
  errorStatus,
  generateDownloadId
} = require('../utils/statusTracker');

// Download single video
async function downloadVideo(req, res) {
  const { url, format = 'best', includeSubtitles = false } = req.body;

  // Validate input
  if (!url || !isValidYouTubeUrl(url)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid YouTube URL',
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
      message: 'Starting video download...'
    });

    // Prepare download
    const outputTemplate = path.join(DOWNLOADS_DIR, '%(title)s.%(ext)s');
    const formatCode = getFormatCode(format);

    // Build yt-dlp command
    let command = `yt-dlp -f "${formatCode}" -o "${outputTemplate}" "${url}"`;
    
    if (includeSubtitles) {
      command += ' --write-subs --sub-langs en';
    }

    // Execute download
    updateStatus(downloadId, {
      progress: 50,
      message: 'Downloading video...'
    });

    execSync(command, { stdio: 'pipe' });

    updateStatus(downloadId, {
      progress: 90,
      message: 'Processing...'
    });

    // Find downloaded file
    const files = fs.readdirSync(DOWNLOADS_DIR);
    const videoFile = files.find(f => !f.endsWith('.vtt') && !f.endsWith('.txt'));

    if (!videoFile) {
      throw new Error('Download completed but file not found');
    }

    const filename = sanitizeFilename(videoFile);
    const fileSize = fs.statSync(path.join(DOWNLOADS_DIR, videoFile)).size;

    completeStatus(downloadId, [{
      filename,
      size: fileSize
    }]);

    res.json({
      status: 'success',
      message: 'Video downloaded successfully',
      data: {
        downloadId,
        filename,
        size: fileSize,
        url: `/downloads/${filename}`
      }
    });

  } catch (error) {
    errorStatus(downloadId, error.message);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Download failed',
      data: null
    });
  }
}

module.exports = {
  downloadVideo
};
