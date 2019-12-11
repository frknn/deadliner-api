const Employee = require('../models/Employee');
const Task = require('../models/Task');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.getAllEmployees = asyncHandler(async (req, res, next) => {
  const employees = await Employee.findAll({
    include: [{
      model: Task,
      attributes: ['name', 'status', 'deadline', 'projectId']
    }]
  });

  res.status(200).json({
    success: true,
    data: employees
  });
});

exports.createEmployee = asyncHandler(async (req, res, next) => {
  const newEmployee = await Employee.create(req.body);

  res.status(201).json({ success: true, data: newEmployee });
});

exports.getSingleEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findByPk(req.params.id)

  if (!employee) {
    return next(
      new ErrorResponse('No employee with given ID', 404)
    );
  }

  res.status(200).json({ success: true, data: employee });
});

exports.removeEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findByPk(req.params.id);

  if (!employee) {
    return next(
      new ErrorResponse('No Employee with given ID!', 400)
    );
  }

  await employee.destroy();

  res.status(200).json({ success: true, data: employee });
});

exports.updateEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findByPk(req.params.id);

  if (!employee) {
    return next(
      new ErrorResponse('No Employee with given ID!', 400)
    );
  }

  let [rowsUpdated, updatedEmployee] = await Employee.update(req.body, {
    returning: true, where: { id: req.params.id }
  });

  res.status(200).json({
    success: true,
    data: updatedEmployee,
    affectedRows: rowsUpdated
  });
});