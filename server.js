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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Basic Auth middleware for API endpoints
const basicAuth = (req, res, next) => {
  console.log('Checking Basic Auth...');
  
  // Get auth header
  const authHeader = req.headers.authorization;
  console.log('Auth header present:', !!authHeader);

  if (authHeader) {
    // Parse Basic Auth header
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    console.log('Auth attempt for username:', username);

    // Check credentials
    if ((username === adminUsername && password === adminPassword) ||
        (username === userUsername && password === userPassword)) {
      console.log('Basic Auth successful');
      req.user = {
        username,
        role: username === adminUsername ? 'admin' : 'user'
      };
      return next();
    }
  }

  // Authentication failed
  console.log('Basic Auth failed');
  res.setHeader('WWW-Authenticate', 'Basic realm="ByteVault API"');
  res.status(401).json({ error: 'Authentication required' });
};

// Session middleware
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

// API endpoints with Basic Auth
app.post('/upload', basicAuth, upload.single('file'), (req, res) => {
  try {
    console.log('Processing file upload...');
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('File uploaded successfully:', req.file.filename);
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

app.get('/files', basicAuth, (req, res) => {
  try {
    console.log('Listing files...');
    fs.readdir('./uploads', (err, files) => {
      if (err) {
        console.error('Error reading files:', err);
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
      console.log('Files found:', fileList.length);
      res.json(fileList);
    });
  } catch (error) {
    console.error('File listing error:', error);
    res.status(500).json({ error: 'Error listing files' });
  }
});

app.delete('/files/:filename', basicAuth, (req, res) => {
  try {
    const filepath = path.join('./uploads', req.params.filename);
    console.log('Attempting to delete:', filepath);
    
    if (!fs.existsSync(filepath)) {
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

// Web interface routes with session auth
app.use(express.static('public'));

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if ((username === adminUsername && password === adminPassword) ||
      (username === userUsername && password === userPassword)) {
    req.session.user = { 
      username,
      role: username === adminUsername ? 'admin' : 'user'
    };
    res.json({ success: true, redirect: '/dashboard' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`ByteVault running on port ${port}`);
  console.log('Admin username configured:', !!adminUsername);
  console.log('User username configured:', !!userUsername);
});
