const Project = require('../models/Project');
const Task = require('../models/Task');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.getAllProjects = asyncHandler(async (req, res, next) => {
  const projects = await Project.findAll({
    include: [{
      model: Task,
      attributes: ['name', 'status', 'deadline', 'employeeId']
    }]
  });

  res.status(200).json({
    success: true,
    data: projects
  });
});

exports.createProject = asyncHandler(async (req, res, next) => {
  const newProject = await Project.create(req.body);

  res.status(201).json({ success: true, data: newProject });
});

exports.getSingleProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findByPk(req.params.id)

  if (!project) {
    return next(
      new ErrorResponse('No Project with given ID', 404)
    );
  }

  res.status(200).json({ success: true, data: project });
});

exports.removeProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findByPk(req.params.id);

  if (!project) {
    return next(
      new ErrorResponse('No Project with given ID', 400)
    );
  }

  await project.destroy();

  res.status(200).json({ success: true, data: project });
});

exports.updateProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findByPk(req.params.id);

  if (!project) {
    return next(
      new ErrorResponse('No Project with given ID', 400)
    );
  }

  let [rowsUpdated, updatedProject] = await Project.update(req.body, {
    returning: true, where: { id: req.params.id }
  });

  res.status(200).json({
    success: true,
    data: updatedProject,
    affectedRows: rowsUpdated
  });
});