const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Store download statuses
const downloadStatus = new Map();

// Create download status entry
function createStatus(id) {
  const status = {
    id,
    progress: 0,
    status: 'pending',
    message: 'Initializing download...',
    startTime: Date.now(),
    endTime: null,
    files: []
  };
  downloadStatus.set(id, status);
  return status;
}

// Update download status
function updateStatus(id, updates) {
  if (downloadStatus.has(id)) {
    const current = downloadStatus.get(id);
    downloadStatus.set(id, { ...current, ...updates });
  }
}

// Get download status
function getStatus(id) {
  return downloadStatus.get(id) || null;
}

// Complete download
function completeStatus(id, files = []) {
  updateStatus(id, {
    status: 'completed',
    progress: 100,
    endTime: Date.now(),
    files
  });
}

// Mark error
function errorStatus(id, message) {
  updateStatus(id, {
    status: 'error',
    progress: 0,
    message,
    endTime: Date.now()
  });
}

// Generate unique ID
function generateDownloadId() {
  return uuidv4();
}

module.exports = {
  createStatus,
  updateStatus,
  getStatus,
  completeStatus,
  errorStatus,
  generateDownloadId
};
