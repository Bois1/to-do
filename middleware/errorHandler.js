const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message} - URL: ${req.originalUrl} - Method: ${req.method}`);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  if (req.accepts('html')) {
    
    res.status(statusCode).render('error', {
      title: 'Error',
      message: message
    });
  } else {
    
    res.status(statusCode).json({
      success: false,
      error: message
    });
  }
};

module.exports = errorHandler;