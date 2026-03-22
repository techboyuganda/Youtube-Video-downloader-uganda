const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const DOWNLOADS_DIR = path.join(__dirname, '../../downloads');

// Validate YouTube URL
function isValidYouTubeUrl(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?youtube\.com|youtu\.?be\/.+/g;
  return youtubeRegex.test(url);
}

// Sanitize filename
function sanitizeFilename(filename) {
  return filename.replace(/[<>:"/\\|?*]/g, '').substring(0, 200);
}

// Ensure downloads directory exists
function ensureDownloadsDir() {
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }
}

// Get yt-dlp installed
function checkYtDlp() {
  try {
    execSync('yt-dlp --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Download video with yt-dlp
function downloadWithYtDlp(url, outputTemplate, formatSpec) {
  const command = `yt-dlp -f "${formatSpec}" -o "${outputTemplate}" "${url}"`;
  
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    throw new Error(`Download failed: ${error.message}`);
  }
}

// Get format code for yt-dlp
function getFormatCode(quality, isAudio = false) {
  const qualityMap = {
    'best': 'best',
    '1080': 'bestvideo[height<=1080]+bestaudio/best',
    '720': 'bestvideo[height<=720]+bestaudio/best',
    '480': 'bestvideo[height<=480]+bestaudio/best',
    '360': 'bestvideo[height<=360]+bestaudio/best',
    '240': 'best[height<=240]'
  };

  if (isAudio) {
    return 'bestaudio/best';
  }

  return qualityMap[quality] || qualityMap['best'];
}

module.exports = {
  isValidYouTubeUrl,
  sanitizeFilename,
  ensureDownloadsDir,
  checkYtDlp,
  downloadWithYtDlp,
  getFormatCode,
  DOWNLOADS_DIR
};
