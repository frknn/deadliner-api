const express = require('express');
const router = express.Router();
const { 
  getAllEmployees, 
  createEmployee, 
  getSingleEmployee,
  removeEmployee,
  updateEmployee,
  getEmployeeProjects } = require('../controllers/employees')

router.route('/')
  .get(getAllEmployees)
  .post(createEmployee)

router.route('/:id')
  .get(getSingleEmployee)
  .delete(removeEmployee)
  .put(updateEmployee)

router.route('/:id/projects')
  .get(getEmployeeProjects)


module.exports = router;