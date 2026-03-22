const { getStatus } = require('../utils/statusTracker');

// Get download status
function getDownloadStatus(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      status: 'error',
      message: 'Download ID is required',
      data: null
    });
  }

  const status = getStatus(id);

  if (!status) {
    return res.status(404).json({
      status: 'error',
      message: 'Download status not found',
      data: null
    });
  }

  res.json({
    status: 'success',
    message: 'Download status retrieved',
    data: status
  });
}

module.exports = {
  getDownloadStatus
};
