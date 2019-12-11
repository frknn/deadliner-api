const Task = require('../models/Task');
const Employee = require('../models/Employee');
const Project = require('../models/Project');

exports.getAllTasks = async (req, res) => {
  const tasks = await Task.findAll({
    include: [
      { model: Employee, as: 'employee' },
      { model: Project, as: 'project' }
    ]

  });
  res.status(200).json({
    success: true,
    data: tasks
  });
}

exports.createTask = async (req, res) => {
  const newTask = await Task.create(req.body);

  res.status(201).json({ success: true, data: newTask });
}

exports.getSingleTask = async (req, res) => {
  const task = await Task.findByPk(req.params.id)

  if (!task) {
    res.status(400).json({ success: false, message: "No Task with given ID" });
  }

  res.status(200).json({ success: true, data: task });
}

exports.removeTask = async (req, res) => {
  const task = await Task.findByPk(req.params.id);

  if (!task) {
    res.status(400).json({ success: false, message: "No Task with given ID" });
  }

  await task.destroy();

  res.status(200).json({ success: true, data: task });
}

exports.updateTask = async (req, res) => {
  const task = await Task.findByPk(req.params.id);

  if (!task) {
    res.status(400).json({ success: false, message: "No Task with given ID" });
  }

  let [rowsUpdated, updatedTask] = await Task.update(req.body, {
    returning: true, where: { id: req.params.id }
  });

  res.status(200).json({
    success: true,
    data: updatedTask,
    affectedRows: rowsUpdated
  });
}