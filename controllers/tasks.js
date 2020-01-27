const Task = require('../models/Task');
const Employee = require('../models/Employee');
const Project = require('../models/Project');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.getAllTasks = asyncHandler(async (req, res, next) => {
  const tasks = await Task.findAll({
    include: [
      { model: Employee, as: 'developer' },
      { model: Employee, as: 'creator' },
      { model: Project, as: 'project' }
    ]
  });

  if (req.user.role === 'Manager') {
    const createdTasks = tasks.filter(task => task.creatorId === req.user.id)
    return res.status(200).json({ success: true, data: createdTasks });
  }

  res.status(200).json({
    success: true,
    data: tasks
  });
});

exports.createTask = asyncHandler(async (req, res, next) => {

  // adding creatorId info to task
  req.body.creatorId = req.user.id

  const newTask = await Task.create(req.body);

  res.status(201).json({ success: true, data: newTask });
});

exports.getSingleTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findByPk(req.params.id)

  if (!task) {
    return next(
      new ErrorResponse('No Task with given ID!', 400)
    );
  }

  if (req.user.role === 'Manager' && task.creatorId !== req.user.id) {
    return next(
      new ErrorResponse('Can not access a task you have not created!', 403)
    );
  }

  res.status(200).json({ success: true, data: task });
});

exports.removeTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findByPk(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse('No Task with given ID', 400)
    );
  }

  if (task.creatorId !== req.user.id) {
    return next(
      new ErrorResponse('Not authorized to perform this operation!', 403)
    )
  }

  await task.destroy();

  res.status(200).json({ success: true, data: task });
});

exports.updateTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findByPk(req.params.id);

  if (!task) {
    return next(
      new ErrorResponse('No Task with given ID', 400)
    );
  }

  if (req.user.role === 'Manager') {
    if (task.creatorId !== req.user.id) {
      return next(
        new ErrorResponse('Not authorized to perform this operation!', 403)
      )
    }
    if (Object.keys(req.body).includes('projectId')) {
      const projects = await Project.findAll({ where: { managerId: req.user.id } })
      if (!projects.map(project => project.id).includes(req.body.projectId)) {
        return next(
          new ErrorResponse('You can not assign a task to a project that does not belong to you!', 403)
        )
      }
    }
  } else if (req.user.role === 'Developer') {
    if (task.employeeId !== req.user.id) {
      return next(
        new ErrorResponse('You cannot update a task that does not belong to you!', 403)
      );
    }
    else if (Object.keys(req.body).filter(key => key !== 'status').length > 0) {
      return next(
        new ErrorResponse('You can only update the status of a task!', 403)
      );
    }
  }

  // extracting affected row amount and updated version of task
  let [rowsUpdated, updatedTask] = await Task.update(req.body, {
    returning: true, where: { id: req.params.id }
  });

  res.status(200).json({
    success: true,
    data: updatedTask,
    affectedRows: rowsUpdated
  });
});