const Employee = require('../models/Employee');
const Task = require('../models/Task');
const Project = require('../models/Project');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

exports.register = asyncHandler(async (req, res, next) => {

  // creating employee with body coming from client
  await Employee.create(req.body)

  res
    .status(201)
    .json({
      success: true,
      message: 'You have successfully registered!'
    });
});

exports.login = asyncHandler(async (req, res, next) => {

  const { email, password } = req.body;

  // Checking if email and password entered
  if (!email || !password) {
    return next(
      new ErrorResponse('Please provide email and password!', 400)
    )
  }

  // Checking if employee with given email exists
  const employee = await Employee.findOne({ where: { email } });
  if (!employee) {
    return next(new ErrorResponse('Invalid Credentials!', 401))
  }

  // Checking if password matches with email in db
  const isMatch = await employee.isPasswordMatch(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid Credentials!', 401))
  }

  // If no error has been occured, generate and return jwt
  // token for login
  sendTokenResponse(employee, 200, res);
});

exports.getCurrentEmployeee = asyncHandler(async (req, res, next) => {
  const currentEmployee = await Employee.findByPk(req.user.id, {
    include: [{
      model: Task,
      attributes: ['name', 'status', 'deadline'],
      include: [{
        model: Project,
        attributes: ['id','name', 'status', 'deadline', 'description']
      }]
    }]
  });

  res.status(200).json({ success: true, data: currentEmployee })
})



// Generate token, create cookie and send response
const sendTokenResponse = (employee, statusCode, res) => {

  // Create token
  const token = employee.getSignedJwtToken();

  // Cookie options
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  }

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Return response
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    })
}
