const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  createEmployee,
  getSingleEmployee,
  removeEmployee,
  updateEmployee } = require('../controllers/employees')

const { protect, authorize } = require('../middleware/auth')

router.route('/')
  .get(protect, authorize('Manager', 'Creator', 'Admin'), getAllEmployees)
  .post(protect, authorize('Admin'), createEmployee)

router.route('/:id')
  .get(protect, authorize('Manager', 'Creator', 'Admin'), getSingleEmployee)
  .delete(protect, authorize('Admin'), removeEmployee)
  .put(protect, authorize('Developer', 'Admin'), updateEmployee)

module.exports = router;