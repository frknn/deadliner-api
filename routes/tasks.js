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
  .get(protect, authorize('Project Manager', 'Project Employee'), getAllTasks)
  .post(protect, authorize('Project Manager'), createTask)

router.route('/:id')
  .get(protect, authorize('Project Manager', 'Project Developer'), getSingleTask)
  .delete(protect, authorize('Project Manager'), removeTask)
  .put(protect, authorize('Project Manager', 'Project Developer'), updateTask)

module.exports = router;