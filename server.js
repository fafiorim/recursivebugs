const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Get environment variables with logging
const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;
const userUsername = process.env.USER_USERNAME;
const userPassword = process.env.USER_PASSWORD;

console.log('Environment variables check:');
console.log('ADMIN_USERNAME configured:', !!adminUsername);
console.log('ADMIN_PASSWORD configured:', !!adminPassword);
console.log('USER_USERNAME configured:', !!userUsername);
console.log('USER_PASSWORD configured:', !!userPassword);

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

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

// Authentication check function with detailed logging
const checkBasicAuth = (req) => {
  console.log('Checking Basic Auth...');
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader ? 'Present' : 'Missing');
  
  if (authHeader) {
    try {
      const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
      const username = auth[0];
      const password = auth[1];
      
      console.log('Auth attempt for username:', username);

      const userPasswords = {
        [adminUsername]: adminPassword,
        [userUsername]: userPassword
      };

      if (userPasswords[username] && userPasswords[username] === password) {
        console.log('Basic Auth successful for:', username);
        return { username, role: username === adminUsername ? 'admin' : 'user' };
      } else {
        console.log('Invalid credentials for:', username);
      }
    } catch (error) {
      console.error('Basic Auth parsing error:', error);
    }
  }
  return null;
};

// Authentication middleware with detailed logging
const requireAuth = (req, res, next) => {
  console.log('\nProcessing authentication...');
  console.log('Request path:', req.path);
  console.log('Session:', req.session);
  
  // Check Basic Auth for API calls
  const basicAuthUser = checkBasicAuth(req);
  if (basicAuthUser) {
    console.log('Basic Auth successful, proceeding...');
    req.user = basicAuthUser;
    return next();
  }
  console.log('Basic Auth failed');

  // Check session auth
  if (req.session.user) {
    console.log('Session auth successful, proceeding...');
    req.user = req.session.user;
    return next();
  }
  console.log('Session auth failed');

  // Handle API endpoints
  if (req.path.startsWith('/upload') || req.path.startsWith('/files')) {
    console.log('API endpoint - returning 401');
    res.setHeader('WWW-Authenticate', 'Basic realm="ByteVault API"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  console.log('Web interface - redirecting to login');
  res.redirect('/login');
};

// API endpoints
app.post('/upload', requireAuth, upload.single('file'), (req, res) => {
  console.log('Processing upload request...');
  try {
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('File upload successful:', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    res.json({ 
      message: 'File uploaded successfully',
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

app.get('/files', requireAuth, (req, res) => {
  console.log('Processing files list request...');
  try {
    fs.readdir('./uploads', (err, files) => {
      if (err) {
        console.error('File listing error:', err);
        return res.status(500).json({ error: 'Error reading files' });
      }
      const fileList = files.map(filename => {
        const stats = fs.statSync(path.join('./uploads', filename));
        return {
          name: filename,
          path: `/uploads/${filename}`,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      });
      console.log('Files list:', fileList);
      res.json(fileList);
    });
  } catch (error) {
    console.error('File listing error:', error);
    res.status(500).json({ error: 'Error listing files' });
  }
});

app.delete('/files/:filename', requireAuth, (req, res) => {
  console.log('Processing delete request for:', req.params.filename);
  try {
    const filepath = path.join('./uploads', req.params.filename);
    if (!fs.existsSync(filepath)) {
      console.log('File not found:', filepath);
      return res.status(404).json({ error: 'File not found' });
    }
    fs.unlink(filepath, (err) => {
      if (err) {
        console.error('File deletion error:', err);
        return res.status(500).json({ error: 'Error deleting file' });
      }
      console.log('File deleted successfully');
      res.json({ message: 'File deleted successfully' });
    });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ error: 'Error deleting file' });
  }
});

// Web interface routes
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const userPasswords = {
      [adminUsername]: adminPassword,
      [userUsername]: userPassword
    };

    const storedPassword = userPasswords[username];
    if (!storedPassword || password !== storedPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = { 
      username,
      role: username === adminUsername ? 'admin' : 'user'
    };
    return res.json({ success: true, redirect: '/dashboard' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`ByteVault running on port ${port}`);
});
