const express = require('express');
const cors = require('cors');
const app = express();
require('./utlis/db.js');
const path = require('path');
const fileUpload = require('express-fileupload');
require('dotenv').config();

app.use(cors());

app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1 // Only allow 1 file per request
  },
  useTempFiles: false,
  abortOnLimit: true,
  parseNested: true,
  preserveExtension: true
}));

app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ 
  limit: '50mb', 
  extended: true,
  parameterLimit: 100000
}));

app.use(express.static(path.join(__dirname, 'public')));

// Routes
const registerRoutes = require('./routes/registerRoutes.js'); 
const adminProfileRoute = require('./routes/adminProfileRoute.js');
app.use(registerRoutes);
app.use(adminProfileRoute);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const port = process.env.PORT; 
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}); 