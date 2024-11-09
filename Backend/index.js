const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// CORS setup for frontend connection
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Request-Method", "GET, POST, DELETE, PUT, OPTIONS");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");
  next();
});


// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://SumitSingh:SumitSingh4321@taskmanager.h7qid.mongodb.net/?retryWrites=true&w=majority&appName=TaskManager').then(() => console.log('MongoDB connected to Atlas'))
  .catch(err => console.error('MongoDB Atlas connection error:', err));

// User schema and model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Task schema and model
const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
});

const Task = mongoose.model('Task', taskSchema);

// Middleware for authenticating JWT
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  jwt.verify(token.split(' ')[1], 'secretKey', (err, decoded) => {
    if (err) {
      return res.status(403).send('Invalid token.');
    }
    req.user = decoded;
    next();
  });
};


// User registration endpoint
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).send('User registered successfully.');
  } catch (error) {
    res.status(500).send('Error registering user: ' + error.message);
  }
});

// User login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send('Invalid email or password.');
    }

    const token = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).send('Error logging in: ' + error.message);
  }
});

// Create a new task
app.post('/tasks', authenticateJWT, async (req, res) => {
  try {
    const { title, description } = req.body;
    const task = new Task({ userId: req.user.userId, title, description });
    await task.save();

    res.status(201).send('Task created successfully.');
  } catch (error) {
    res.status(500).send('Error creating task: ' + error.message);
  }
});

// Read tasks
app.get('/tasks', authenticateJWT, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId });
    res.json(tasks);
  } catch (error) {
    res.status(500).send('Error fetching tasks: ' + error.message);
  }
});

// Update a task
app.put('/tasks/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { title, description, completed },
      { new: true }
    );

    if (!task) {
      return res.status(404).send('Task not found.');
    }

    res.send('Task updated successfully.');
  } catch (error) {
    res.status(500).send('Error updating task: ' + error.message);
  }
});

// Delete a task
app.delete('/tasks/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!task) {
      return res.status(404).send('Task not found.');
    }

    res.send('Task deleted successfully.');
  } catch (error) {
    res.status(500).send('Error deleting task: ' + error.message);
  }
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('Server running on port', port);
});
