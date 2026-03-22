# YouTube Downloader

A modern, web-based YouTube video downloader built with Node.js and Express. Download videos, playlists, and audio from YouTube with support for multiple formats and qualities.

## Features

✨ **Core Capabilities**
- 📹 Download single videos in multiple formats (MP4, WebM, etc.)
- 📋 Batch download entire playlists
- 🎵 Extract audio in multiple formats (MP3, M4A, WAV, OPUS)
- 📝 Download subtitles automatically
- ⚡ Real-time progress tracking
- 🎚️ Quality selection (1080p, 720p, 480p, 360p, 240p)
- 🔊 Customizable audio bitrate selection

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Video Processing**: yt-dlp
- **HTTP Client**: axios
- **Security**: CORS enabled

## Installation

### Prerequisites
- Node.js (v14+)
- npm (v6+)
- yt-dlp (installed automatically or via system package manager)

### Setup Steps

1. **Clone and navigate to project**
   ```bash
   cd path/to/downloader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure .env** (optional)
   - Adjust PORT, DOWNLOAD_TIMEOUT, storage paths as needed

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
downloader/
├── server.js                 # Main Express application
├── package.json              # Dependencies
├── .env.example             # Configuration template
├── README.md                # Documentation
├── public/                  # Frontend files
│   ├── index.html          # Web interface
│   ├── css/
│   │   └── style.css       # Styling
│   └── js/
│       └── app.js          # Client-side logic
├── src/                    # Backend logic
│   ├── routes/             # API endpoints
│   ├── controllers/        # Business logic
│   ├── utils/              # Helper functions
│   └── config/             # Configuration
└── downloads/              # Downloaded files storage
```

## API Endpoints

### POST /api/download/video
Download a single video
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "format": "best",
  "includeSubtitles": true
}
```

### POST /api/download/playlist
Download an entire playlist
```json
{
  "url": "https://www.youtube.com/playlist?list=...",
  "format": "720",
  "startIndex": 0,
  "endIndex": 10
}
```

### POST /api/download/audio
Extract audio only
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "format": "mp3",
  "bitrate": "320"
}
```

### GET /api/info
Get video information
```url
/api/info?url=https://www.youtube.com/watch?v=...
```

### GET /api/status/:id
Check download status
```url
/api/status/download_id
```

## Usage

### Web Interface

1. **Open browser** and go to `http://localhost:3000`
2. **Select tab** for Single Video, Playlist, or Audio
3. **Enter URL** and customize settings
4. **Click Download** and wait for completion
5. **Download file** when ready

### Command Line (Alternative)

```bash
# No CLI provided - use web interface
```

## Configuration

Edit `.env` file to customize:

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| DOWNLOAD_TIMEOUT | 300000 | Timeout in ms (5 minutes) |
| MAX_VIDEO_QUALITY | 1080 | Maximum quality in pixels |
| DOWNLOADS_PATH | ./downloads | Storage directory |
| MAX_STORAGE_MB | 10000 | Max storage quota |

## Error Handling

The application includes comprehensive error handling:
- Invalid URL detection
- Network error handling
- Storage quota management
- Request validation
- Detailed error messages

## Security Features

- ✅ Input sanitization
- ✅ CORS configuration
- ✅ Rate limiting support (can be added)
- ✅ File size validation
- ✅ Timeout protection

## Troubleshooting

### "Module not found" error
```bash
npm install
```

### Port already in use
```bash
# Change PORT in .env or use:
PORT=3001 npm start
```

### yt-dlp not found
```bash
# Install yt-dlp globally
npm install -g yt-dlp
# Or use the one in node_modules
```

### Large downloads timeout
- Increase `DOWNLOAD_TIMEOUT` in `.env`
- Check internet connection
- Try smaller videos first

## Performance Tips

1. **Batch Downloads**: Group multiple videos into playlists
2. **Quality Selection**: Lower quality = faster downloads
3. **Audio Only**: Significantly smaller file sizes
4. **Storage**: Monitor `./downloads` directory size

## Future Enhancements

- [ ] User authentication
- [ ] Download history tracking
- [ ] Queue management
- [ ] Notification system
- [ ] Schedule downloads
- [ ] Video thumbnails preview
- [ ] Stream live videos
- [ ] Channel downloads

## License

MIT License - Feel free to use and modify

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review logs in server console
3. Verify URL is valid and public
4. Ensure yt-dlp is updated: `npm update yt-dlp`

## Contributing

Contributions welcome! Areas to improve:
- Error messages
- UI/UX enhancements
- Performance optimization
- New features
- Documentation

---

**Happy Downloading! 🚀**
