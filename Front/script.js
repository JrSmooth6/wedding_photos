const uploadForm = document.getElementById('uploadForm');
const photoInput = document.getElementById('photoInput');
const statusMessage = document.getElementById('statusMessage');

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const files = photoInput.files;
  if (files.length === 0) {
    statusMessage.textContent = 'Veuillez sélectionner au moins une photo.';
    return;
  }

  const formData = new FormData();
  for (const file of files) {
    formData.append('photos', file);
  }

  statusMessage.textContent = 'Envoi en cours...';

  try {
    const res = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      statusMessage.textContent = '✅ Photos envoyées avec succès. Merci !';
      uploadForm.reset();
    } else {
      statusMessage.textContent = '❌ Une erreur est survenue pendant l’envoi.';
    }
  } catch (err) {
    console.error(err);
    statusMessage.textContent = '❌ Impossible de contacter le serveur.';
  }
});
