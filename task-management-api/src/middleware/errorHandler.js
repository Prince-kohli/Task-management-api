const { ApiError } = require('../utils/ApiError');

function errorHandler(err, req, res, next) {
  const apiError = err instanceof ApiError ? err : new ApiError(500, 'Server error');

  if (!(err instanceof ApiError)) {
    console.error(err);
  }

  res.status(apiError.statusCode).json({
    message: apiError.message,
    details: apiError.details || null,
  });
}

module.exports = { errorHandler };
