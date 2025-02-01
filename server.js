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

// Authentication middleware that checks both session and basic auth
const requireAuth = (req, res, next) => {
  // Check if user is authenticated via session
  if (req.session.user) {
    return next();
  }

  // Check for basic auth header
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    const userPasswords = {
      [adminUsername]: adminPassword,
      [userUsername]: userPassword
    };

    if (userPasswords[username] && userPasswords[username] === password) {
      req.user = { 
        username,
        role: username === adminUsername ? 'admin' : 'user'
      };
      return next();
    }
  }

  // If no valid authentication, return 401
  res.setHeader('WWW-Authenticate', 'Basic realm="ByteVault API"');
  res.status(401).json({ error: 'Authentication required' });
};

// Serve static files
app.use(express.static('public'));

[... existing routes remain the same ...]

// Updated API endpoints with better error handling
app.post('/upload', requireAuth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
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
      res.json(fileList);
    });
  } catch (error) {
    console.error('File listing error:', error);
    res.status(500).json({ error: 'Error listing files' });
  }
});

app.delete('/files/:filename', requireAuth, (req, res) => {
  try {
    const filepath = path.join('./uploads', req.params.filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    fs.unlink(filepath, (err) => {
      if (err) {
        console.error('File deletion error:', err);
        return res.status(500).json({ error: 'Error deleting file' });
      }
      res.json({ message: 'File deleted successfully' });
    });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ error: 'Error deleting file' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`ByteVault running on port ${port}`);
});
