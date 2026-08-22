export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Resource not found',
      errors: [{ message: `Invalid resource ID format: ${err.value}` }]
    });
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered',
      errors: [{ message: 'A resource with this unique value already exists' }]
    });
  }

  // Fallback server error
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: [{ message: 'An unexpected error occurred on the server' }]
  });
};
