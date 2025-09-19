require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const flash = require('express-flash');

const connectDB = require('./config/database');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();


app.use(morgan('combined', {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 
  }
}));


app.use(flash());


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
  res.locals.user = req.session.userId ? { id: req.session.userId, username: req.session.username } : null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});


app.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.redirect('/tasks');
});

app.use('/tasks', taskRoutes);
app.use('/', authRoutes);


app.use((req, res, next) => {
  logger.warn(`404 - Page not found: ${req.originalUrl}`);
  res.status(404).render('404', { title: 'Page Not Found' });
});


app.use(errorHandler);


app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Visit http://localhost:${PORT} to access the application`);
});

module.exports = app;