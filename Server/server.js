const express = require('express');
const multer = require('multer');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const mime = require('mime-types');
const convertHeicToJpeg = require('./convert-heic');
const cors = require('cors');
const archiver = require('archiver');

const app = express();
const port = 3000;
const logFilePath = path.join(__dirname, 'server.log');

const upload = multer({ dest: 'uploads/tmp/' });
app.use(cors());
app.use(express.static(path.join(__dirname, '../client')));

// 🪵 Fonction d’écriture dans le fichier de logs
function logToFile(message) {
  const timestamp = new Date().toISOString();
  const fullMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFilePath, fullMessage);
}

// Fonction asynchrone pour déplacer un fichier entre volumes différents
async function moveFile(src, dest) {
  await fsPromises.copyFile(src, dest);
  await fsPromises.unlink(src);
}

// 📤 Upload de fichiers
app.post('/upload', upload.array('photos', 20), async (req, res) => {
  try {
    const photoDir = path.join(__dirname, 'uploads/photos');
    const videoDir = path.join(__dirname, 'uploads/videos');
    if (!fs.existsSync(photoDir)) await fsPromises.mkdir(photoDir, { recursive: true });
    if (!fs.existsSync(videoDir)) await fsPromises.mkdir(videoDir, { recursive: true });

    for (const file of req.files) {
      const ext = mime.extension(file.mimetype);
      const originalName = file.originalname;
      const isHeic = file.mimetype === 'image/heic' || file.originalname.toLowerCase().endsWith('.heic');
      const isImage = file.mimetype.startsWith('image/');
      const isVideo = file.mimetype.startsWith('video/');

      if (isImage) {
        const targetPath = path.join(photoDir, `${Date.now()}-${originalName}`);
        if (isHeic) {
          const outputPath = targetPath.replace(/\.heic$/i, '.jpg');
          await convertHeicToJpeg(file.path, outputPath);
          await fsPromises.unlink(file.path);
          logToFile(`✅ Image HEIC convertie et enregistrée : ${outputPath}`);
        } else {
          await moveFile(file.path, targetPath);
          logToFile(`✅ Image enregistrée : ${targetPath}`);
        }
      } else if (isVideo) {
        const targetPath = path.join(videoDir, `${Date.now()}-${originalName}`);
        await moveFile(file.path, targetPath);
        logToFile(`🎥 Vidéo enregistrée : ${targetPath}`);
      } else {
        await fsPromises.unlink(file.path);
        logToFile(`⚠️ Fichier ignoré (type non supporté) : ${originalName}`);
      }
    }

    res.status(200).json({ message: 'Fichiers reçus avec succès' });
  } catch (err) {
    console.error(err);
    logToFile(`❌ Erreur upload : ${err.message}`);
    res.status(500).json({ error: 'Erreur lors de l’envoi des fichiers' });
  }
});

// 📦 Téléchargement des fichiers en zip
app.get('/download', (req, res) => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const zipName = 'mariage-photos-videos.zip';
  const uploadsDir = path.join(__dirname, 'uploads');

  res.attachment(zipName);
  logToFile(`⬇️ Téléchargement ZIP demandé : ${zipName}`);

  archive.on('error', err => {
    console.error('Erreur archive:', err);
    logToFile(`❌ Erreur archive : ${err.message}`);
    res.status(500).send({ error: 'Erreur lors de la création de l’archive' });
  });

  archive.pipe(res);
  archive.directory(path.join(uploadsDir, 'photos'), 'photos');
  archive.directory(path.join(uploadsDir, 'videos'), 'videos');
  archive.finalize();
});

// 📄 Route pour consulter les logs
app.get('/logs', (req, res) => {
  try {
    if (!fs.existsSync(logFilePath)) {
      return res.status(404).send('Aucun log trouvé.');
    }
    const logs = fs.readFileSync(logFilePath, 'utf8');
    res.setHeader('Content-Type', 'text/plain');
    res.send(logs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la lecture des logs.');
  }
});

app.listen(port, () => {
  logToFile(`🚀 Serveur lancé sur http://localhost:${port}`);
  console.log(`✅ Serveur en ligne sur http://localhost:${port}`);
});
