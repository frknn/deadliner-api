const Sequelize = require('sequelize');
const db = require('../config/database');
const Task = require('./Task');

const Employee = db.define('employee', {
  first_name: {
    type: Sequelize.STRING(50)
  },
  last_name: {
    type: Sequelize.STRING(50)
  },
  job: {
    type: Sequelize.STRING(50)
  }
});

Employee.hasMany(Task);
Task.belongsTo(Employee);


module.exports = Employee;