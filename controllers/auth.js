const Employee = require('../models/Employee');
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


// Generate token, create cookie and send response
const sendTokenResponse = (employee, statusCode, res) => {

  // Create token
  const token = employee.getSignedJwtToken();

  // Cookie options
  const opitons = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  }

  if (process.env.NODE_ENV === 'production') {
    opitons.secure = true;
  }

  // Return response
  res
    .status(statusCode)
    .cookie('token', token, opitons)
    .json({
      success: true,
      token
    })
}
