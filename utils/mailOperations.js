const Task = require('../models/Task');
const Employee = require('../models/Employee');
const { Op } = require('sequelize')
const nodemailer = require('nodemailer');

const getMailsOfTasksNearDeadline = async (req, res, next) => {
  const tasks = await Task.findAll({
    include: [
      { model: Employee, as: 'developer' },
      { model: Employee, as: 'creator' }
    ],
    where: {
      // Returns tasks which has 2 days or less to deadline.
      deadline: { [Op.lte]: new Date(new Date().getTime() + 86400000) }
    }
  })

  let mails = tasks.map(task => ({
    id: task.id,
    devMail: task.getDataValue('developer').getDataValue('email'),
    creatorMail: task.getDataValue('creator').getDataValue('email')
  }));

  return mails;
}

exports.sendEmails = async () => {

  const devMails = await (await getMailsOfTasksNearDeadline()).map(mails => mails.devMail)
  const creatorMails = await (await getMailsOfTasksNearDeadline()).map(mails => mails.creatorMail)

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  })

  messageToDevs = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: devMails,
    subject: 'Task Deadline',
    text: 'Some of your tasks have less than 2 days to deadline. Please check them out!'
  }

  messageToCreators = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: creatorMails,
    subject: 'Task Deadline',
    text: 'Some of your created tasks have less than 2 days to deadline. You may want to check them out!'
  }

  const devInfo = await transporter.sendMail(messageToDevs);
  const creatorInfo = await transporter.sendMail(messageToCreators);

  console.log('Mail sent: %s', devInfo.messageId, creatorInfo.messageId)
}


