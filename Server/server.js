const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const convertHeicToJpeg = require('./convert-heic');
const cors = require('cors');
const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/tmp/' }); // dossier temporaire
app.use(cors())
// Permet au client d’accéder au front s'il est dans le même dossier
app.use(express.static(path.join(__dirname, '../client')));

// Route d’upload
app.post('/upload', upload.array('photos', 10), async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    for (const file of req.files) {
      const ext = mime.extension(file.mimetype);
      const originalName = file.originalname;
      const isHeic = file.mimetype === 'image/heic' || file.originalname.toLowerCase().endsWith('.heic');

      const targetPath = path.join(uploadDir, `${Date.now()}-${originalName}`);

      if (isHeic) {
        const outputPath = targetPath.replace(/\.heic$/i, '.jpg');
        await convertHeicToJpeg(file.path, outputPath);
        fs.unlinkSync(file.path); // supprimer temporaire
      } else {
        fs.renameSync(file.path, targetPath);
      }
    }

    res.status(200).json({ message: 'Photos reçues avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l’envoi des fichiers' });
  }
});

app.listen(port, () => {
  console.log(`Serveur en ligne sur http://localhost:${port}`);
});
