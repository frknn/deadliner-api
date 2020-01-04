const express = require('express');
const router = express.Router();
const { 
  getAllEmployees, 
  createEmployee, 
  getSingleEmployee,
  removeEmployee,
  updateEmployee,
  getEmployeeProjects } = require('../controllers/employees')

const { protect, authorize } = require('../middleware/auth')

router.route('/')
  .get(protect, authorize('Project Manager'), getAllEmployees)
  .post(protect, authorize('Project Manager'),  createEmployee)

router.route('/:id')
  .get(protect, authorize('Project Manager'), getSingleEmployee)
  .delete(protect, authorize('Project Manager'), removeEmployee)
  .put(protect,  authorize('Project Manager'),updateEmployee)

router.route('/:id/projects')
  .get(protect, authorize('Project Manager'), getEmployeeProjects)


module.exports = router;