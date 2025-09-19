const logger = require('../config/logger');

const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    logger.warn(`Unauthorized access attempt to ${req.originalUrl}`);
    return res.status(401).redirect('/login');
  }
  next();
};

module.exports = {
  requireAuth
};