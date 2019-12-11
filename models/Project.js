const Sequelize = require('sequelize');
const db = require('../config/database');
//const Task = require('./Task');

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
  }
});

//Project.hasMany(Task);


module.exports = Project;