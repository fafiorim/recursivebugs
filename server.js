const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Get environment variables
const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;
const userUsername = process.env.USER_USERNAME;
const userPassword = process.env.USER_PASSWORD;

// Startup logging
console.log('Starting ByteVault with configuration:');
console.log('Admin username configured:', !!adminUsername);
console.log('User username configured:', !!userUsername);
console.log('Public directory contents:');
fs.readdir(path.join(__dirname, 'public'), (err, files) => {
  if (err) console.error('Error reading public dir:', err);
  else console.log(files);
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Session configuration
app.use(session({
  secret: 'bytevault-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Serve static files with proper paths
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
const requireAuth = (req, res, next) => {
  console.log('Auth check - Session:', req.session);
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Root route with explicit redirect
app.get('/', (req, res) => {
  console.log('Root path accessed, session:', req.session);
  if (req.session.user) {
    console.log('Redirecting to dashboard');
    res.redirect('/dashboard');
  } else {
    console.log('Redirecting to login');
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  console.log('Login page requested');
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  const loginPath = path.join(__dirname, 'public', 'login.html');
  console.log('Serving login page from:', loginPath);
  res.sendFile(loginPath);
});

app.post('/login', async (req, res) => {
  console.log('Login attempt:', req.body);
  try {
    const { username, password } = req.body;
    
    const userPasswords = {
      [adminUsername]: adminPassword,
      [userUsername]: userPassword
    };

    const storedPassword = userPasswords[username];
    if (!storedPassword) {
      console.log('User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (password === storedPassword) {
      req.session.user = { 
        username,
        role: username === adminUsername ? 'admin' : 'user'
      };
      console.log('Login successful for:', username);
      return res.json({ success: true, redirect: '/dashboard' });
    } else {
      console.log('Invalid password for:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/dashboard', requireAuth, (req, res) => {
  console.log('Dashboard requested by:', req.session.user?.username);
  const dashboardPath = path.join(__dirname, 'public', 'dashboard.html');
  console.log('Serving dashboard from:', dashboardPath);
  res.sendFile(dashboardPath);
});

// Rest of your routes...

app.listen(port, '0.0.0.0', () => {
  console.log(`ByteVault running on port ${port}`);
});
