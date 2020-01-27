const Project = require('../models/Project');
const Task = require('../models/Task');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Employee = require('../models/Employee');

exports.getAllProjects = asyncHandler(async (req, res, next) => {

  const projects = await Project.findAll({
    include: [{
      model: Task,
      attributes: ['name', 'status', 'deadline'],
      include: [{
        model: Employee,
        as: 'developer',
        attributes: ['first_name', 'last_name', 'job']
      }]
    }, {
      model: Employee,
      as: 'creator',
      attributes: ['first_name', 'last_name', 'job']
    }, {
      model: Employee,
      as: 'manager'
    }]
  });

  // add developers to each project as a seperate attribute,
  // by iterating over tasks and collect employee data from each task
  projects.map(project => project.setDataValue('developers', project.get('tasks').map(task => task.developer)));

  // If current user is manager, return projects assigned to current user
  // If current user is creator, return projects created by current user
  // If current user is admin, return all projects
  if (req.user.role === 'Manager') {
    const assignedProjects = projects.filter(project => project.managerId === req.user.id);
    return res.status(200).json({ success: true, data: assignedProjects });
  } else if (req.user.role === 'Creator') {
    const createdProjects = projects.filter(project => project.creatorId === req.user.id);
    return res.status(200).json({ success: true, data: createdProjects });
  } else {
    res.status(200).json({ success: true, data: projects });
  }

});

exports.createProject = asyncHandler(async (req, res, next) => {

  req.body.creatorId = req.user.id;

  const newProject = await Project.create(req.body);

  res.status(201).json({ success: true, data: newProject });
});

exports.getSingleProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findByPk(req.params.id, {
    include: [{
      model: Task,
      attributes: ['name', 'status', 'deadline'],
      include: [{
        model: Employee,
        as: 'developer',
        attributes: ['id', 'first_name', 'last_name', 'job']
      }, {
        model: Employee,
        as: 'creator',
        attributes: ['id', 'first_name', 'last_name', 'job']
      }]
    }, {
      model: Employee, as: 'creator',
      attributes: ['id', 'first_name', 'last_name', 'job']
    }, {
      model: Employee, as: 'manager',
      attributes: ['id', 'first_name', 'last_name', 'job']
    }]
  })

  if (!project) {
    return next(
      new ErrorResponse('No Project with given ID', 404)
    );
  }

  // added developers as a seperate attribute to project,
  // by iterating over tasks of that project and collecting
  // developer data
  const developers = project.get('tasks').map(task => task.developer);
  project.setDataValue('developers', developers)

  if (req.user.role === 'Developer' && project.get().developers.filter(dev => dev.id === req.user.id).length === 0) {
    return next(
      new ErrorResponse('Cannot access a project you are not working for!', 403)
    )
  }

  if (req.user.role === 'Manager' && project.managerId !== req.user.id) {
    return next(
      new ErrorResponse('Cannot access a project you are not assigned to.', 403)
    )
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

  if (req.user.role === 'Creator' && project.creatorId !== req.user.id) {
    return next(
      new ErrorResponse('You can not delete a project that does not belong to you!', 403)
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

  if (req.user.role === 'Creator') {
    if (project.creatorId !== req.user.id) {
      return next(
        new ErrorResponse('You can not update a project that does not belong to you!', 403)
      );
    }
    if (req.body.managerId) {
      const emp = await Employee.findByPk(req.body.managerId);
      if (emp.get('role') !== 'Manager') {
        return next(
          new ErrorResponse('You can only assign projects to managers!', 403)
        )
      }
    }
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