const Task = require('../models/Task');
const logger = require('../config/logger');

const taskController = {

  index: async (req, res, next) => {
    try {
      const { filter = 'all' } = req.query;
      let query = { userId: req.session.userId };
      
    
      if (filter === 'pending') {
        query.status = 'pending';
      } else if (filter === 'completed') {
        query.status = 'completed';
      } else if (filter === 'deleted') {
        query.status = 'deleted';
      }
      
      const tasks = await Task.find(query).sort({ createdAt: -1 });
      
      res.render('index', {
        title: 'My Tasks',
        tasks,
        currentFilter: filter
      });
    } catch (error) {
      logger.error(`Error fetching tasks: ${error.message}`);
      req.flash('error', 'Failed to load tasks');
      res.redirect('/');
    }
  },


  showCreate: (req, res) => {
    res.render('createTask', { title: 'Create New Task' });
  },


  create: async (req, res, next) => {
    try {
      const { title, description } = req.body;

      if (!title) {
        req.flash('error', 'Title is required');
        return res.redirect('/tasks/create');
      }

      const task = new Task({
        userId: req.session.userId,
        title,
        description: description || ''
      });

      await task.save();
      
      logger.info(`Task created by user ${req.session.username}: ${title}`);
      req.flash('success', 'Task created successfully');
      res.redirect('/');
    } catch (error) {
      logger.error(`Error creating task: ${error.message}`);
      req.flash('error', 'Failed to create task');
      res.redirect('/tasks/create');
    }
  },


  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'completed', 'deleted'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const task = await Task.findOneAndUpdate(
        { _id: id, userId: req.session.userId },
        { status },
        { new: true }
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      logger.info(`Task status updated by user ${req.session.username}: ${task.title} -> ${status}`);
      
      if (req.accepts('html')) {
        req.flash('success', 'Task updated successfully');
        res.redirect('/');
      } else {
        res.json({
          success: true,
          message: 'Task updated successfully',
          task
        });
      }
    } catch (error) {
      logger.error(`Error updating task status: ${error.message}`);
      
      if (req.accepts('html')) {
        req.flash('error', 'Failed to update task');
        res.redirect('/');
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to update task'
        });
      }
    }
  },

  
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      const task = await Task.findOneAndUpdate(
        { _id: id, userId: req.session.userId },
        { status: 'deleted' },
        { new: true }
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      logger.info(`Task deleted by user ${req.session.username}: ${task.title}`);
      
      if (req.accepts('html')) {
        req.flash('success', 'Task deleted successfully');
        res.redirect('/');
      } else {
        res.json({
          success: true,
          message: 'Task deleted successfully'
        });
      }
    } catch (error) {
      logger.error(`Error deleting task: ${error.message}`);
      
      if (req.accepts('html')) {
        req.flash('error', 'Failed to delete task');
        res.redirect('/');
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to delete task'
        });
      }
    }
  }
};

module.exports = taskController;