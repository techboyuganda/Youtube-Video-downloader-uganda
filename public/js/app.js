// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;

        // Remove active class from all buttons and content
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        e.target.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Single video form
document.getElementById('singleVideoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = document.getElementById('videoUrl').value;
    const format = document.getElementById('videoFormat').value;
    const includeSubtitles = document.querySelector('input[name="includeSubtitles"]').checked;

    await downloadVideo(url, format, includeSubtitles);
});

// Playlist form
document.getElementById('playlistForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = document.getElementById('playlistUrl').value;
    const format = document.getElementById('playlistFormat').value;
    const startIndex = parseInt(document.getElementById('startIndex').value) || 0;
    const endIndex = document.getElementById('endIndex').value ? parseInt(document.getElementById('endIndex').value) : null;

    await downloadPlaylist(url, format, startIndex, endIndex);
});

// Audio form
document.getElementById('audioForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = document.getElementById('audioUrl').value;
    const format = document.getElementById('audioFormat').value;
    const bitrate = document.getElementById('audioBitrate').value;

    await downloadAudio(url, format, bitrate);
});

async function downloadVideo(url, format, includeSubtitles) {
    showProgress();
    try {
        const response = await fetch('/api/download/video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                format,
                includeSubtitles
            })
        });

        const data = await response.json();

        if (response.ok) {
            showResults([{
                title: data.data.filename,
                success: true,
                downloadUrl: data.data.url
            }]);
            document.getElementById('singleVideoForm').reset();
        } else {
            showResults([{
                title: 'Download Failed',
                success: false,
                error: data.message
            }]);
        }
    } catch (error) {
        showResults([{
            title: 'Error',
            success: false,
            error: error.message
        }]);
    } finally {
        hideProgress();
    }
}

async function downloadPlaylist(url, format, startIndex, endIndex) {
    showProgress();
    try {
        const response = await fetch('/api/download/playlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                format,
                startIndex,
                endIndex
            })
        });

        const data = await response.json();

        if (response.ok) {
            showResults(data.data.videos.map(v => ({
                title: v.filename,
                success: true,
                downloadUrl: v.url
            })));
            document.getElementById('playlistForm').reset();
        } else {
            showResults([{
                title: 'Download Failed',
                success: false,
                error: data.message
            }]);
        }
    } catch (error) {
        showResults([{
            title: 'Error',
            success: false,
            error: error.message
        }]);
    } finally {
        hideProgress();
    }
}

async function downloadAudio(url, format, bitrate) {
    showProgress();
    try {
        const response = await fetch('/api/download/audio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                format,
                bitrate
            })
        });

        const data = await response.json();

        if (response.ok) {
            showResults([{
                title: data.data.filename,
                success: true,
                downloadUrl: data.data.url
            }]);
            document.getElementById('audioForm').reset();
        } else {
            showResults([{
                title: 'Download Failed',
                success: false,
                error: data.message
            }]);
        }
    } catch (error) {
        showResults([{
            title: 'Error',
            success: false,
            error: error.message
        }]);
    } finally {
        hideProgress();
    }
}

function showProgress() {
    const section = document.getElementById('progressSection');
    section.classList.remove('hidden');
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressText').textContent = '0%';
    document.getElementById('statusText').textContent = 'Preparing download...';
}

function hideProgress() {
    setTimeout(() => {
        document.getElementById('progressSection').classList.add('hidden');
    }, 1000);
}

function showResults(results) {
    const section = document.getElementById('resultsSection');
    const list = document.getElementById('resultsList');

    list.innerHTML = results.map(result => {
        if (result.success) {
            return `
                <div class="result-item success">
                    <div class="result-item-title">✓ ${result.title}</div>
                    <a href="${result.downloadUrl}" class="result-item-link" download>Download File</a>
                </div>
            `;
        } else {
            return `
                <div class="result-item error">
                    <div class="result-item-title">✗ ${result.title}</div>
                    <div class="result-item-error">${result.error}</div>
                </div>
            `;
        }
    }).join('');

    section.classList.remove('hidden');
}

// Update progress
function updateProgress(percent, status) {
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').textContent = percent + '%';
    document.getElementById('statusText').textContent = status;
}
