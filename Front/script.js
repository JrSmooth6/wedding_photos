const form = document.getElementById('uploadForm');
const inputFile = document.getElementById('file');
const statusDiv = document.getElementById('status');
const progressBar = document.getElementById('progressBar');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusDiv.textContent = '';
  statusDiv.className = '';
  progressBar.style.width = '0%';

  if (!inputFile.files.length) {
    showError("Veuillez sélectionner au moins une photo.");
    return;
  }

  const files = inputFile.files;
  const totalFiles = files.length;
  let successCount = 0;

  statusDiv.textContent = `0 / ${totalFiles} fichiers envoyés...`;

  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];

    if (file.size > 30 * 1024 * 1024) {
      showError(`Le fichier "${file.name}" est trop volumineux (max 30 Mo).`);
      return;
    }

    const formData = new FormData();
    formData.append('photos', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = `Erreur lors de l'envoi du fichier "${file.name}".`;
        try {
          const errJson = await response.json();
          if (errJson?.message) errorMsg = errJson.message;
        } catch {}

        showError(errorMsg);
        return;
      }

      successCount++;
      updateProgress(successCount, totalFiles);
    } catch (err) {
      showError(`Erreur réseau pour le fichier "${file.name}".`);
      return;
    }
  }

  if (successCount === totalFiles) {
    showSuccess("Toutes les photos ont été envoyées avec succès !");
    form.reset();
    progressBar.style.width = '100%';
  }
});

function updateProgress(done, total) {
  const percent = Math.round((done / total) * 100);
  progressBar.style.width = percent + '%';
  statusDiv.textContent = `${done} / ${total} fichiers envoyés...`;
}

function showError(message) {
  statusDiv.textContent = message;
  statusDiv.className = 'error';
  progressBar.style.width = '0%';
}

function showSuccess(message) {
  statusDiv.textContent = message;
  statusDiv.className = 'success';
}
