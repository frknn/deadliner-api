const Sequelize = require('sequelize');
const db = require('../config/database');
const Task = require('./Task');

const Project = db.define('project', {
  name: {
    type: Sequelize.STRING(100)
  },
  status: {
    type: Sequelize.STRING(25)
  },
  deadline: {
    type: Sequelize.DATE
  },
  description: {
    type: Sequelize.TEXT
  },
  createdBy: {
    type: Sequelize.INTEGER
  },
  assignedTo: {
    type: Sequelize.INTEGER
  }
});

/* 
  to fetch the data for both of owner and belonging,
  we need to define below relationship in the 1 side 
  of a 1-to-N relationship 
*/
Project.hasMany(Task, {
  onDelete: 'CASCADE',
  hooks: true
});
Task.belongsTo(Project);

module.exports = Project;