const Employee = require('../models/Employee');
const asyncHandler = require('../middleware/async');

exports.register = asyncHandler(async (req, res, next) => {

  // creating employee with body coming from client
  const employee = await Employee.create(req.body)
  const token = employee.getSignedJwtToken();

  res
    .status(200)
    .json({
      success: true,
      token
    })
});
