const Sequelize = require('sequelize');
const db = require('../config/database');

const Task = db.define('task', {
  name: {
    type: Sequelize.STRING(100)
  },
  status: {
    type: Sequelize.STRING(25)
  },
  deadline: {
    type: Sequelize.DATE
  },
  createdBy: {
    type: Sequelize.INTEGER
  }
});

module.exports = Task;