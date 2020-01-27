const Sequelize = require('sequelize');
const db = require('../config/database');
const Task = require('./Task');
const Project = require('./Project');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Employee = db.define('employee', {
  first_name: {
    type: Sequelize.STRING(50)
  },
  last_name: {
    type: Sequelize.STRING(50)
  },
  job: {
    type: Sequelize.STRING(50)
  },
  role: {
    type: Sequelize.ENUM,
    values: ['Manager', 'Developer', 'Creator', 'Admin']
  },
  email: {
    type: Sequelize.STRING(60),
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: Sequelize.TEXT,
    allowNull: false
  }
});

Employee.addHook('beforeSave', async function (employee, options) {
  const salt = await bcrypt.genSalt(10);
  employee.password = await bcrypt.hash(employee.password, salt);
})

Employee.prototype.getSignedJwtToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
}

Employee.prototype.isPasswordMatch = async function (enteredPw) {
  return await bcrypt.compare(enteredPw, this.password)
}

/* 
  to fetch the data for both of owner and belonging,
  we need to define below relationship in the 1 side 
  of a 1-to-N relationship 
*/

Employee.hasMany(Task, {
  foreignKey: { name: 'creatorId' },
  as: 'createdTasks'
});
Employee.hasMany(Task, {
  foreignKey: { name: 'developerId' },
  as: 'assignments'
});

Employee.hasMany(Project, {
  foreignKey: { name: 'creatorId' },
  as: 'createdProjects'
});
Employee.hasMany(Project, {
  foreignKey: { name: 'managerId' },
  as: 'assignedProjects'
});


Task.belongsTo(Employee, {
  as: 'developer',
  foreignKey: 'developerId'
});
Task.belongsTo(Employee, {
  as: 'creator',
  foreignKey: 'creatorId'
});


Project.belongsTo(Employee, {
  as: 'manager',
  foreignKey: 'managerId'
});
Project.belongsTo(Employee, {
  as: 'creator',
  foreignKey: 'creatorId'
});


module.exports = Employee;