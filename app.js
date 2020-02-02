const express = require('express');
const errorHandler = require('./middleware/error');
const dotenv = require('dotenv');
const db = require('./config/database');
const cookieParser = require('cookie-parser');
const CronJob = require('cron').CronJob;
const { sendEmails } = require('./utils/mailOperations');


// PORT
const PORT = process.env.PORT || 5000;

// Express instance
const app = express();

// Load env variables
dotenv.config({ path: './config/config.env' });

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// routes
const employees = require('./routes/employees');
const tasks = require('./routes/tasks');
const projects = require('./routes/projects');
const auth = require('./routes/auth');

// Test DB connection
db
  .authenticate()
  .then(() => console.log('Connected to DB successfully!'))
  .catch(err => console.log('Error: ', err));

// Synchronizing DB
// db.sync({ force: true });

// index route
app.get('/', (req, res) => res.send('INDEX'));

// using routes
app.use('/employees', employees);
app.use('/tasks', tasks);
app.use('/projects', projects);
app.use('/auth', auth);


const job = new CronJob('00 09 * * *', async function () {
  console.log('09:00 EVERY DAY')
  await sendEmails();
}, null, true, 'Europe/Istanbul')


// error handler middleware
app.use(errorHandler);

app.listen(PORT, console.log(`Server started on port ${PORT}`));