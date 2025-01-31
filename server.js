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

// Session configuration
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
  
  // Get plain passwords from secrets
  const userPasswords = {
    [${{ vars.ADMIN_USERNAME }}]: ${{ secrets.ADMIN_PASSWORD }},
    [${{ vars.USER_USERNAME }}]: ${{ secrets.USER_PASSWORD }}
  };

  // Hash the provided password and compare
  const userPassword = userPasswords[username];
  if (!userPassword) {
    return res.redirect('/login?error=1');
  }

  const hashedPassword = await bcrypt.hash(userPassword, 10);
  if (await bcrypt.compare(password, hashedPassword)) {
    req.session.user = { 
      username,
      role: username === ${{ vars.ADMIN_USERNAME }} ? 'admin' : 'user'
    };
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
