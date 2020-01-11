const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  createProject,
  getSingleProject,
  removeProject,
  updateProject,
  getProjectEmployees } = require('../controllers/projects')

const { protect, authorize } = require('../middleware/auth')

router.route('/')
  .get(protect, authorize('Project Manager'), getAllProjects)
  .post(protect, authorize('Project Manager'), createProject)

router.route('/:id')
  .get(protect, authorize('Project Manager', 'Project Developer'), getSingleProject)
  .delete(protect, authorize('Project Manager'), removeProject)
  .put(protect, authorize('Project Manager'), updateProject)

router.route('/:id/employees')
  .get(protect, authorize('Project Manager', 'Project Developer'), getProjectEmployees)

module.exports = router;