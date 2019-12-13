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
        attributes: ['first_name', 'last_name', 'job']
      }]
    }]
  });

  /* tranforming the returning projects object
     to its json format which includes only related object data,
     not metadata 
  */
  let projectsData = JSON.parse(JSON.stringify(projects))

  /* picked the employees from projects's tasks array and include
     them into a employees array to provide a
     more understandable and useful json data
  */
  projectsData.forEach(project => project.employees = project.tasks.map(task => task.employee))

  res.status(200).json({
    success: true,
    data: projectsData
  });
});

exports.getProjectEmployees = asyncHandler(async (req, res, next) => {
  const project = await Project.findByPk(req.params.id, {
    include: [{
      model: Task,
      attributes: ['name', 'status', 'deadline'],
      include: [{
        model: Employee,
        attributes: ['first_name', 'last_name', 'job']
      }]
    }]
  });

  if (!project) {
    return next(
      new ErrorResponse('No Project with given ID', 400)
    );
  }

  let projectData = JSON.parse(JSON.stringify(project))

  let employees = projectData.tasks.map(task => task.employee)

  res.status(200).json({
    success: true,
    data: employees
  });
});

exports.createProject = asyncHandler(async (req, res, next) => {
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
        attributes: ['first_name', 'last_name', 'job']
      }]
    }]
  })

  if (!project) {
    return next(
      new ErrorResponse('No Project with given ID', 404)
    );
  }

  let projectData = JSON.parse(JSON.stringify(project))

  projectData.employees = projectData.tasks.map(task => task.employee)

  res.status(200).json({ success: true, data: projectData });
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