const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  createProject,
  getSingleProject,
  removeProject,
  updateProject } = require('../controllers/projects')

const { protect, authorize } = require('../middleware/auth')

router.route('/')
  .get(protect, authorize('Manager', 'Creator', 'Admin'), getAllProjects)
  .post(protect, authorize('Creator', 'Admin'), createProject)

router.route('/:id')
  .get(protect, authorize('Developer', 'Manager', 'Creator', 'Admin'), getSingleProject)
  .delete(protect, authorize('Creator', 'Admin'), removeProject)
  .put(protect, authorize('Creator', 'Admin'), updateProject)

module.exports = router;