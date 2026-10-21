(() => {
  const slot = document.querySelector('.gallery-cover-slot');
  const input = document.getElementById('cover-upload');
  if (!slot || !input) return;
  const status = slot.querySelector('.cover-upload-status');
  const key = 'afterglow-cover-v1';
  function show(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.alt = 'Обложка вечера';
      image.onload = () => {
        slot.querySelector('img')?.remove();
        slot.prepend(image);
        slot.classList.add('has-cover');
        resolve();
      };
      image.onerror = reject;
      image.src = src;
    });
  }
  try {
    const saved = localStorage.getItem(key);
    if (saved) show(saved).catch(() => localStorage.removeItem(key));
  } catch {}
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) || file.size > 20 * 1024 * 1024) {
      status.textContent = 'Выбери JPG, PNG, WebP или AVIF до 20 МБ.';
      input.value = '';
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const src = canvas.toDataURL('image/webp', .85);
      localStorage.setItem(key, src);
      await show(src);
    } catch {
      status.textContent = 'Не удалось сохранить обложку. Попробуй файл поменьше.';
      input.value = '';
    }
  });
})();
