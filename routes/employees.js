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
  .get(protect, authorize('Manager', 'Admin'), getAllEmployees)
  .post(protect, authorize('Admin'), createEmployee)

router.route('/:id')
  .get(protect, authorize('Manager', 'Admin'), getSingleEmployee)
  .delete(protect, authorize('Admin'), removeEmployee)
  .put(protect, authorize('Developer', 'Admin'), updateEmployee)

router.route('/:id/projects')
  .get(protect, authorize('Manager', 'Admin'), getEmployeeProjects)


module.exports = router;