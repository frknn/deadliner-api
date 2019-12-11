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

/* 
  to fetch the data for both of owner and belonging,
  we need to define below relationship in the 1 side 
  of a 1-to-N relationship 
*/
Employee.hasMany(Task);
Task.belongsTo(Employee);


module.exports = Employee;