const AppError = require('../utils/appError');

// MongoDB errors
const handleCastError = err => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

const handleDuplicateKey = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use different value.`;

  return new AppError(message, 400);
};

const handleValidationError = err => {
  const errors = Object.values(err.errors)
    .map(el => el.message)
    .join('. ');

  const message = `Invalid input data. ${errors}`;
  return new AppError(message, 400);
};

// JWT errors
const handleJWTError = () =>
  new AppError('Invalid JWT token. Please log in again', 401);

const handleTokenExpiredError = () =>
  new AppError('Your token has expired. Please log in again', 401);

// Responses
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  console.error(err);

  res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};

module.exports = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let errCp = { ...err };
    errCp.message = err.message;

    if (errCp.name === 'CastError') errCp = handleCastError(errCp);
    if (errCp.code === 11000) errCp = handleDuplicateKey(errCp);
    if (errCp.name === 'ValidationError') errCp = handleValidationError(errCp);
    if (errCp.name === 'JsonWebTokenError') errCp = handleJWTError();
    if (errCp.name === 'TokenExpiredError') errCp = handleTokenExpiredError();

    sendErrorProd(errCp, res);
  }
};
