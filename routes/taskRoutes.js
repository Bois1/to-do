const express = require('express');
const taskController = require('../controllers/taskController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();


router.use(requireAuth);


router.get('/', taskController.index);
router.get('/create', taskController.showCreate);
router.post('/create', taskController.create);
router.post('/:id/status', taskController.updateStatus);
router.delete('/:id', taskController.delete);

module.exports = router;