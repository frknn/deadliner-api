const express = require('express');
const router = express.Router();
const { 
  getAllTasks, 
  createTask, 
  getSingleTask,
  removeTask,
  updateTask } = require('../controllers/tasks')

router.route('/')
  .get(getAllTasks)
  .post(createTask)

router.route('/:id')
  .get(getSingleTask)
  .delete(removeTask)
  .put(updateTask)

module.exports = router;