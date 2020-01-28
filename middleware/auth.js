const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const Employee = require('../models/Employee');
const Project = require('../models/Project');
const Task = require('../models/Task');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // getting directly sent token
  if (
    req.headers.authorization
    && req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  // Getting token from cookie
  // else if (req.cookies.token){
  //   token = req.cookies.token;
  // }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route!', 401))
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded JWT: ", decoded);

    const user = await Employee.findByPk(decoded.id);

    switch (user.get('role')) {
      case 'Developer':
        const assignments = await Task.findAll({
          where: {
            developerId: user.get('id')
          },
          include: [{
            model: Project, as: 'project', include: Task
          }, {
            model: Employee, as: 'creator'
          }]
        });

        user.setDataValue('assignments', assignments.map(assignment => assignment.get()));
        req.user = user.get();
        break;

      case 'Manager':
        const createdTasks = await Task.findAll({
          where: {
            creatorId: user.get('id')
          },
          include: [{
            model: Project, as: 'project'
          }]
        });

        const assignedProjects = await Project.findAll({
          where: { managerId: user.get('id') }
        });

        user.setDataValue('createdTasks', createdTasks.map(task => task.get()));
        user.setDataValue('assignedProjects', assignedProjects.map(proj => proj.get()))
        req.user = user.get();
        break;

      case 'Creator':
        const createdProjects = await Project.findAll({
          where: {
            creatorId: user.get('id')
          },
          include: [{
            model: Task,
            include: [{
              model: Employee, as: 'developer'
            }, {
              model: Employee, as: 'creator'
            }]
          }, {
            model: Employee,
            as: 'manager'
          }]
        });
        user.setDataValue('createdProjects', createdProjects.map(project => project.get()));
        req.user = user.get();
        break;
      default:
        req.user = user.get();
        break;
    }

    next();

  } catch (err) {
    console.log(err);
    return next(new ErrorResponse('Not authorized to access this route!', 401))
  }

})

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route!`, 403))
    }
    next();
  }
}