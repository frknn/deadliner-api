const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const Employee = require('../models/Employee');

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

    console.log(decoded);

    req.user = await Employee.findByPk(decoded.id);

    next();

  } catch (err) {
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