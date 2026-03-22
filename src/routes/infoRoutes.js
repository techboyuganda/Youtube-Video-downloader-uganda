const { execSync } = require('child_process');
const { isValidYouTubeUrl } = require('../utils/downloadUtils');

// Get video information
async function getVideoInfo(req, res) {
  const { url } = req.query;

  if (!url || !isValidYouTubeUrl(url)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid or missing YouTube URL',
      data: null
    });
  }

  try {
    // Use yt-dlp to get video info
    const command = `yt-dlp -j --no-warnings "${url}"`;
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    const videoInfo = JSON.parse(output);

    res.json({
      status: 'success',
      message: 'Video information retrieved',
      data: {
        title: videoInfo.title,
        duration: videoInfo.duration,
        uploader: videoInfo.uploader,
        uploadDate: videoInfo.upload_date,
        thumbnail: videoInfo.thumbnail,
        description: videoInfo.description?.substring(0, 200) || '',
        viewCount: videoInfo.view_count,
        formats: videoInfo.formats?.length || 0
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve video information',
      data: null
    });
  }
}

module.exports = {
  getVideoInfo
};
