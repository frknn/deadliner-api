const express = require('express');
const router = express.Router();
const { 
  getAllTasks, 
  createTask, 
  getSingleTask,
  removeTask,
  updateTask } = require('../controllers/tasks')

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('Manager', 'Admin'), getAllTasks)
  .post(protect, authorize('Manager', 'Admin'), createTask)

router.route('/:id')
  .get(protect, authorize('Manager', 'Admin'), getSingleTask)
  .delete(protect, authorize('Manager', 'Admin'), removeTask)
  .put(protect, authorize('Developer', 'Manager', 'Admin'), updateTask)

module.exports = router;