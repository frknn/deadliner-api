const Sequelize = require('sequelize');
const db = require('../config/database');
const Project = require('./Project');
const Employee = require('./Employee');

const Task = db.define('task', {
  name: {
    type: Sequelize.STRING(100)
  },
  status: {
    type: Sequelize.STRING(25)
  },
  deadline: {
    type: Sequelize.DATE
  }
});

Task.belongsTo(Employee);
Task.belongsTo(Project);

module.exports = Task;