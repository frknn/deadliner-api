const Employee = require('../models/Employee');
const Task = require('../models/Task');
const Project = require('../models/Project');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

exports.getAllEmployees = asyncHandler(async (req, res, next) => {

  const employees = await Employee.findAll({
    include: [{
      model: Task,
      as: 'assignments',
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
        as: 'manager'
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

  // got all employees, filtered them by their roles and got developers, extracted projects to a separate attribute by iterating over "tasks" data
  employees.filter(e => e.role === 'Developer').map(d => d.setDataValue('projects', d.get('assignments').map(a => a.project)))

  // delete unnecessary attributes from all of employee objects
  employees.map(employee => deleteUnnecessaryFields(employee, returnUnnecessaryFields(employee.role)))

  // If current user is manager, return just developers
  // If current user is creator, return just managers
  // If current user is admin, return all users
  if (req.user.role === 'Manager') {
    const developers = employees.filter(e => e.role === 'Developer')
    res.status(200).json({ success: true, data: developers });
  } else if (req.user.role === 'Creator') {
    const managers = employees.filter(e => e.role === 'Manager')
    res.status(200).json({ success: true, data: managers });
  } else {
    res.status(200).json({ success: true, data: employees });
  }

});

exports.createEmployee = asyncHandler(async (req, res, next) => {
  const newEmployee = await Employee.create(req.body);

  res.status(201).json({ success: true, data: newEmployee });
});

exports.getSingleEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findByPk(req.params.id, {
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
  })

  if (!employee) {
    return next(
      new ErrorResponse('No employee with given ID', 404)
    );
  }

  // added projects as a seperate attribute to developer,
  // by iterating over tasks of that developer and collecting
  // project data
  if (employee.role === 'Developer') {
    const projects = employee.get('assignments').map(assignment => assignment.project);
    employee.setDataValue('projects', projects)
  }

  // Managers can only display devs,
  // creators can only display managers
  if (req.user.role === 'Manager' && employee.role !== 'Developer') {
    return next(
      new ErrorResponse('You are not allowed to display info about this employee!', 403)
    )
  }
  if (req.user.role === 'Creator' && employee.role !== 'Manager') {
    return next(
      new ErrorResponse('You are not allowed to display info about this employee!', 403)
    )
  }

  // deleting unnecessary attributes from found employee
  deleteUnnecessaryFields(employee, returnUnnecessaryFields(employee.role))

  res.status(200).json({ success: true, data: employee });
});

exports.removeEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findByPk(req.params.id);

  if (!employee) {
    return next(
      new ErrorResponse('No Employee with given ID!', 400)
    );
  }

  await employee.destroy();

  res.status(200).json({ success: true, data: employee });
});

exports.updateEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findByPk(req.params.id);

  if (!employee) {
    return next(
      new ErrorResponse('No Employee with given ID!', 400)
    );
  }

  let [rowsUpdated, updatedEmployee] = await Employee.update(req.body, {
    returning: true, where: { id: req.params.id }
  });

  res.status(200).json({
    success: true,
    data: updatedEmployee,
    affectedRows: rowsUpdated
  });
});

// deletes given attributes from given employee
const deleteUnnecessaryFields = (emp, fields) => {
  fields.forEach(field => delete emp.get()[field])
}

// returns different unnecessary fields according to given role
// as an array to use in deleteUnnecessaryAttr function
const returnUnnecessaryFields = (role) => {
  if (role === 'Developer') return ['createdTasks', 'createdProjects', 'assignedProjects', 'password']
  if (role === 'Manager') return ['assignments', 'createdProjects', 'password']
  if (role === 'Creator') return ['assignments', 'createdTasks', 'assignedProjects', 'password']
  if (role === 'Admin') return ['assignments', 'createdTasks', 'createdProjects', 'assignedProjects', 'password']
}