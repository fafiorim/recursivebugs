const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// User database
const users = {
  admin: {
    password: '$2b$10$rZB2oyvKgVu8TFZ.F8hKx.K0vgz9SyN5HEtF9zKqBAEHn7hL3R5Ji', // &f0f482d*2d18
    role: 'admin'
  },
  user: {
    password: '$2b$10$G0NbEY1TNXDcpvNEJqAKz.OVxnD.CMERqG5OFJUzNrZYcMHKL0K2q', // &f0f482da2d18
    role: 'user'
  }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'bytevault-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Serve static files
app.use(express.static('public'));

// Routes
app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];

  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = { username, role: user.role };
    res.redirect('/dashboard');
  } else {
    res.redirect('/login?error=1');
  }
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.post('/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ 
    message: 'File uploaded successfully',
    filename: req.file.filename
  });
});

app.get('/files', requireAuth, (req, res) => {
  fs.readdir('./uploads', (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading files' });
    }
    const fileList = files.map(filename => ({
      name: filename,
      path: `/uploads/${filename}`
    }));
    res.json(fileList);
  });
});

app.delete('/files/:filename', requireAuth, (req, res) => {
  const filepath = path.join('./uploads', req.params.filename);
  fs.unlink(filepath, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting file' });
    }
    res.json({ message: 'File deleted successfully' });
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`ByteVault running on port ${port}`);
});
