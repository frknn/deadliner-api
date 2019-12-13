const express = require('express');
const router = express.Router();
const { 
  getAllProjects, 
  createProject, 
  getSingleProject,
  removeProject,
  updateProject,
  getProjectEmployees } = require('../controllers/projects')

router.route('/')
  .get(getAllProjects)
  .post(createProject)

router.route('/:id')
  .get(getSingleProject)
  .delete(removeProject)
  .put(updateProject)

router.route('/:id/employees')
  .get(getProjectEmployees)

module.exports = router;