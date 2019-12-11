const express = require('express');
const router = express.Router();
const { 
  getAllEmployees, 
  createEmployee, 
  getSingleEmployee,
  removeEmployee,
  updateEmployee } = require('../controllers/employees')

router.route('/')
  .get(getAllEmployees)
  .post(createEmployee)

router.route('/:id')
  .get(getSingleEmployee)
  .delete(removeEmployee)
  .put(updateEmployee)


module.exports = router;