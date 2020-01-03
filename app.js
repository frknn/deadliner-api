const express = require('express');
const errorHandler = require('./middleware/error');

// PORT
const PORT = process.env.PORT || 5000;

// Express instance
const app = express();

// Body parser
app.use(express.json());

// routes
const employees = require('./routes/employees');
const tasks = require('./routes/tasks');
const projects = require('./routes/projects');
const auth = require('./routes/auth');

// Database
const db = require('./config/database');

// Test DB
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
app.use(auth);

// error handler middleware
app.use(errorHandler);

app.listen(PORT, console.log(`Server started on port ${PORT}`));