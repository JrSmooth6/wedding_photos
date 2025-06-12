const form = document.getElementById('uploadForm');
const inputFile = document.getElementById('file');
const statusDiv = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Reset messages
  statusDiv.textContent = '';
  statusDiv.className = '';

  if (!inputFile.files.length) {
    showError("Veuillez sélectionner au moins une photo.");
    return;
  }

  const files = inputFile.files;
  const formData = new FormData();

  for (const file of files) {
    // Optionnel: vérifier taille max (ex: 10 Mo)
    if (file.size > 30 * 1024 * 1024) {
      showError(`Le fichier "${file.name}" est trop volumineux (max 10 Mo).`);
      return;
    }

    // Ajouter fichiers dans formData
    formData.append('photos', file);
  }

  try {
    statusDiv.textContent = "Envoi en cours...";
    statusDiv.className = '';

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // Essaie de récupérer le message d'erreur du backend (JSON)
      let errorMsg = "Erreur lors de l'envoi. Veuillez réessayer.";
      try {
        const errJson = await response.json();
        if (errJson?.message) errorMsg = errJson.message;
      } catch {}

      showError(errorMsg);
      return;
    }

    const result = await response.json();
    showSuccess("Photos envoyées avec succès, merci !");
    form.reset();
  } catch (err) {
    showError("Erreur réseau. Vérifiez votre connexion.");
  }
});

function showError(message) {
  statusDiv.textContent = message;
  statusDiv.className = 'error';
}

function showSuccess(message) {
  statusDiv.textContent = message;
  statusDiv.className = 'success';
}
