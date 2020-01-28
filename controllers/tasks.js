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

  if (req.user.role === 'Manager' && req.body.creatorId) {
    return next(
      new ErrorResponse('You are not allowed to perform this operationa!', 403)
    )
  }
  // adding creatorId info to task
  req.body.creatorId = req.user.id

  // If task wanna be assigned to a dev at creation,
  // check that employee exists and is a developer
  if (req.body.developerId) {
    const emp = await Employee.findByPk(req.body.developerId);
    if (!emp) {
      return next(
        new ErrorResponse('No Employee with given ID!', 400)
      );
    } else if (emp.get('role') !== 'Developer') {
      return next(
        new ErrorResponse('You can only assign tasks to developers!', 403)
      )
    }
  }

  // If task wanna be assigned to a project at creation,
  // check that project exists or current user
  // is the manager of the project
  if (req.body.projectId) {
    const project = await Project.findByPk(req.body.projectId)
    if (!project) {
      return next(
        new ErrorResponse('No project with given ID!', 400)
      )
    }
    if (req.user.role === 'Manager') {
      if (!req.user.assignedProjects.map(proj => proj.id).includes(req.body.projectId)) {
        return next(
          new ErrorResponse('You can not assign a task to a project that does not belong to you!', 403)
        )
      }
    }
  }

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

  // if current user is a manager, do not allow to update the
  // creatorId, updating someone elses task or assigning a task
  // to someone elses project
  // if current user is a developer, only allow to update
  // their tasks' 'status' attribute.
  if (req.user.role === 'Manager') {
    if (req.body.creatorId) {
      return next(
        new ErrorResponse('You cannot change creatorId!', 400)
      )
    }
    if (task.creatorId !== req.user.id) {
      return next(
        new ErrorResponse('Not authorized to perform this operation!', 403)
      )
    }

    if (req.body.projectId) {
      if (!req.user.assignedProjects.map(proj => proj.id).includes(req.body.projectId)) {
        return next(
          new ErrorResponse('You can not assign a task to a project that does not belong to you!', 403)
        )
      }
    }
  } else if (req.user.role === 'Developer') {
    if (task.developerId !== req.user.id) {
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

  if (req.body.developerId) {
    const emp = await Employee.findByPk(req.body.developerId);
    if (!emp) {
      return next(
        new ErrorResponse('No Employee with given ID!', 400)
      );
    } else if (emp.get('role') !== 'Developer') {
      return next(
        new ErrorResponse('You can only assign tasks to developers!', 403)
      )
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