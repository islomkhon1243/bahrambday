// Анимированные GIF, PNG, WebP или JPG. Пути относительно gallery.html.
// Например GIF: images: ['assets/animation.gif']. Можно смешивать GIF и PNG.
window.BAHRAM_GALLERY_PILE = {
  images: ['assets/photos/back.gif'],
  cell: 86,       // размер места под картинку в пикселях
  rate: 6,        // картинок в секунду
  opacity: 0.32, // прозрачность фона: 0–1
  fill: 0.78,     // высота заполнения до провала
  cycle: 45,      // максимальная длительность заполнения в секундах
  speed: 0.8,
  wave: true
};
