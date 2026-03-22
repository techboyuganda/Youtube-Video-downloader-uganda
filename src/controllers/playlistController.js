// Playlist download controller
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

// Download playlist
async function downloadPlaylist(req, res) {
  const { url, format = 'best', startIndex = 0, endIndex = null } = req.body;

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
      message: 'Starting playlist download...'
    });

    // Prepare download
    const outputTemplate = path.join(DOWNLOADS_DIR, '%(playlist_title)s', '%(playlist_index)03d - %(title)s.%(ext)s');
    const formatCode = getFormatCode(format);

    // Build yt-dlp command
    let command = `yt-dlp -f "${formatCode}" -o "${outputTemplate}" "${url}"`;

    // Add playlist item range if specified
    if (startIndex !== undefined || endIndex !== undefined) {
      const start = startIndex || 1;
      const end = endIndex ? endIndex + 1 : '';
      command += ` --playlist-items ${start}${end ? '-' + end : ':'}`;
    }

    updateStatus(downloadId, {
      progress: 30,
      message: 'Downloading playlist videos...'
    });

    execSync(command, { stdio: 'pipe' });

    updateStatus(downloadId, {
      progress: 90,
      message: 'Processing playlist...'
    });

    // Find downloaded files
    const allFiles = [];
    const walksDirectory = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            walksDirectory(fullPath);
          } else if (!file.endsWith('.vtt') && !file.endsWith('.txt')) {
            allFiles.push({
              filename: sanitizeFilename(file),
              path: fullPath,
              size: stat.size
            });
          }
        });
      } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
      }
    };

    walksDirectory(DOWNLOADS_DIR);

    if (allFiles.length === 0) {
      throw new Error('Playlist download completed but no files found');
    }

    const videos = allFiles.map((file, index) => ({
      index,
      filename: file.filename,
      size: file.size,
      url: `/downloads/${file.filename}`
    }));

    completeStatus(downloadId, allFiles);

    res.json({
      status: 'success',
      message: `Playlist downloaded successfully (${videos.length} videos)`,
      data: {
        downloadId,
        videoCount: videos.length,
        videos
      }
    });

  } catch (error) {
    errorStatus(downloadId, error.message);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Playlist download failed',
      data: null
    });
  }
}

module.exports = {
  downloadPlaylist
};
