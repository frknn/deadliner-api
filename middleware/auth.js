const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const Employee = require('../models/Employee');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { deleteUnnecessaryFields, returnUnnecessaryFields } = require('../utils/unnecessaryFields');

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

    const user = await Employee.findByPk(decoded.id, {
      include: [{
        model: Task, as: 'assignments',
        attributes: ['name', 'status', 'deadline'],
        include: [{
          model: Project,
          attributes: ['name', 'status', 'deadline', 'description']
        }]
      }, {
        model: Task,
        as: 'createdTasks',
        attributes: ['name', 'status', 'deadline'],
        include: [{
          model: Project,
          attributes: ['name', 'status', 'deadline', 'description']
        }, {
          model: Employee, as: 'developer',
          attributes: ['first_name', 'last_name', 'job']
        }]
      }, {
        model: Project,
        as: 'createdProjects',
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
          as: 'manager',
          attributes: ['first_name', 'last_name', 'job']
        }]
      }, {
        model: Project,
        as: 'assignedProjects',
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
          as: 'manager',
          attributes: ['first_name', 'last_name', 'job']
        }]
      }]
    });

    if (user.role === 'Developer') {
      const projects = user.get('assignments').map(assignment => assignment.project);
      user.setDataValue('projects', projects)
    }

    deleteUnnecessaryFields(user, returnUnnecessaryFields(user.role));

    req.user = user.get();

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