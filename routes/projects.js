const express = require('express');
const router = express.Router();
const { 
  getAllProjects, 
  createProject, 
  getSingleProject,
  removeProject,
  updateProject } = require('../controllers/projects')

router.route('/')
  .get(getAllProjects)
  .post(createProject)

router.route('/:id')
  .get(getSingleProject)
  .delete(removeProject)
  .put(updateProject)

module.exports = router;