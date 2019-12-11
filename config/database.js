const Sequelize = require('sequelize').Sequelize;

module.exports = new Sequelize('d5iusjohfuetcr', 'ozgbjfqahwcczc', 'c7718e7290a111739d48c8264c901534d9a9a49605775fc4651d6222b77aa7a3', {
  host: 'ec2-54-217-228-25.eu-west-1.compute.amazonaws.com',
  dialect: 'postgres',
  dialectOptions: {
    ssl: true
  }
});
