const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = 5000;
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');


// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    const uploadDateTime = Date.now() + '-' + Math.round(Math.random() * 1e9);
    console.log(file)
    file.uploadDateTime = uploadDateTime;
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// // Define a single file upload endpoint
// app.post('/upload-single', upload.single('file'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No file uploaded.');
//   }

//   const fileUrl = `http://localhost:${port}/${req.file.path}`;
//   return res.json({ message: 'Single file uploaded successfully', fileUrl });
// });

// Define a multiple files upload endpoint
app.post('/upload-multiple', upload.array('files', 5), (req, res) => {
  if (!req.files) {
    return res.status(400).send('No files uploaded.');
  }

  const fileUrls = req.files.map((file) => file);
  return res.json({ message: 'Multiple files uploaded successfully', fileUrls });
});

app.get('/files', (req, res) => {
    const fs = require('fs');
    fs.readdir('./uploads', (err, files) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error reading files');
      } else {
        res.json(files);
      }
    });
  });

  app.get('/preview/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    console.log(filePath)
    fs.exists(filePath, (exists) => {
      if (exists) {
        res.sendFile(filePath);
      } else {
        res.status(404).send('File not found');
      }
    });
  }); 
  
  app.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    res.download(filePath, req.params.filename);
  });

  app.get('/previewpdf/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  const dataBuffer = fs.readFileSync(filePath);

  pdf(dataBuffer).then((data) => {
    res.json({ text: data.text });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
