const User = require('../models/User');
const logger = require('../config/logger');

const authController = {
  
  showLogin: (req, res) => {
    if (req.session.userId) {
      return res.redirect('/');
    }
    res.render('login', { title: 'Login' });
  },


  showRegister: (req, res) => {
    if (req.session.userId) {
      return res.redirect('/');
    }
    res.render('register', { title: 'Register' });
  },

 
  register: async (req, res, next) => {
    try {
      const { username, password } = req.body;

     
      if (!username || !password) {
        req.flash('error', 'Please provide both username and password');
        return res.redirect('/register');
      }

     
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        req.flash('error', 'Username already exists');
        return res.redirect('/register');
      }

    
      const user = new User({
        username,
        passwordHash: password
      });

      await user.save();
      
      logger.info(`New user registered: ${username}`);
      req.flash('success', 'Registration successful. Please login.');
      res.redirect('/login');
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      req.flash('error', 'Registration failed. Please try again.');
      res.redirect('/register');
    }
  },


  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;

     
      if (!username || !password) {
        req.flash('error', 'Please provide both username and password');
        return res.redirect('/login');
      }

      
      const user = await User.findOne({ username });
      if (!user) {
        req.flash('error', 'Invalid username or password');
        return res.redirect('/login');
      }

      
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        req.flash('error', 'Invalid username or password');
        return res.redirect('/login');
      }

      
      req.session.userId = user._id;
      req.session.username = user.username;
      
      logger.info(`User logged in: ${username}`);
      req.flash('success', 'Login successful');
      res.redirect('/');
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      req.flash('error', 'Login failed. Please try again.');
      res.redirect('/login');
    }
  },

  
  logout: (req, res) => {
    const username = req.session.username;
    req.session.destroy((err) => {
      if (err) {
        logger.error(`Logout error: ${err.message}`);
        return res.redirect('/');
      }
      
      if (username) {
        logger.info(`User logged out: ${username}`);
      }
      
      res.redirect('/login');
    });
  }
};

module.exports = authController;