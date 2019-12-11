const Employee = require('../models/Employee');
const Task = require('../models/Task');

exports.getAllEmployees = async (req, res) => {
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
}

exports.createEmployee = async (req, res) => {
  const newEmployee = await Employee.create(req.body);

  res.status(201).json({ success: true, data: newEmployee });
}

exports.getSingleEmployee = async (req, res) => {
  const employee = await Employee.findByPk(req.params.id)

  if (!employee) {
    res.status(400).json({ success: false, message: "No Employee with given ID" });
  }

  res.status(200).json({ success: true, data: employee });
}

exports.removeEmployee = async (req, res) => {
  const employee = await Employee.findByPk(req.params.id);

  if (!employee) {
    res.status(400).json({ success: false, message: "No Employee with given ID" });
  }

  await employee.destroy();

  res.status(200).json({ success: true, data: employee });
}

exports.updateEmployee = async (req, res) => {
  const employee = await Employee.findByPk(req.params.id);

  if (!employee) {
    res.status(400).json({ success: false, message: "No Employee with given ID" });
  }

  let [rowsUpdated, updatedEmployee] = await Employee.update(req.body, {
    returning: true, where: { id: req.params.id }
  });

  res.status(200).json({
    success: true,
    data: updatedEmployee,
    affectedRows: rowsUpdated
  });
}