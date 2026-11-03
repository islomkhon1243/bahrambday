// Добавляйте обычные фотографии в assets/photos/ и указывайте путь в src.
// null — дизайнерская заглушка, никаких запросов к несуществующим файлам.
// Указывайте width/height оригинала: сетка заранее сохранит его пропорции.
window.BAHRAM_GALLERY = Array.from({ length: 30 }, (_, i) => ({
  src: `assets/photos/image_${i + 1}.jpg`
}));

// Горизонтальная картинка в первом экране: PNG, GIF, WebP или JPG.
// Например, src: 'assets/gallery-banner.gif'. null оставляет место пустым.
window.BAHRAM_GALLERY_HERO = {
  src: 'assets/photos/hero.png',
  alt: ''
};
