// scripts.js

// GSAP для заголовков
gsap.from("#hero h1", { duration: 1, opacity: 0, scale: 0.5, ease: "back.out(1.7)" });
gsap.from("#hero p", { duration: 1, opacity: 0, y: -50, delay: 0.5, ease: "power2.out" });

// Эффект звука удара
const punchSound = document.getElementById("punch-sound");
document.querySelector(".main-title").addEventListener("click", () => {
    punchSound.currentTime = 0;
    punchSound.play();
    gsap.to(".main-title", { duration: 0.2, scale: 1.1, yoyo: true, repeat: 1 });
});

// Анимация фотографий при наведении
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
        gsap.to(item, { duration: 0.3, scale: 1.2, rotate: -5 });
    });
    item.addEventListener('mouseleave', () => {
        gsap.to(item, { duration: 0.3, scale: 1, rotate: 0 });
    });
});

document.querySelectorAll('.belt').forEach(belt => {
    belt.addEventListener('mouseenter', () => {
        gsap.to(belt, { duration: 0.5, scale: 1.1 });
    });
    belt.addEventListener('mouseleave', () => {
        gsap.to(belt, { duration: 0.5, scale: 1 });
    });
});

const button = document.getElementById('music-button');
        const audioPlayer = document.getElementById('audio-player');

        // Массив аудиофайлов
        const musicTracks = ['music/music1.mp3', 'music/music2.mp3', 'music/music3.mp3', 'music/music4.mp3'];
        let currentTrack = 0; // Индекс текущего трека

        // Массив текстов для кнопки
        const buttonLabels = [
            "Ой, не то, го другую",
            "Опять, не то, бляяя",
			"Прикольно, но мимо",
            "Самое то"
        ];

        // Функция для переключения музыки
        function changeMusic() {
            // Если не достигли последнего трека
            if (currentTrack < musicTracks.length) {
                // Устанавливаем текущий трек
                audioPlayer.src = musicTracks[currentTrack];
                audioPlayer.play();

                // Обновляем текст кнопки
                button.textContent = buttonLabels[currentTrack] || "Самое то";

                // Переходим к следующему треку
                currentTrack++;
            } else {
                // Останавливаем функционал кнопки, делая её неактивной
                button.textContent = "Самое то";
                button.disabled = true;
                button.style.cursor = 'default';
                button.style.backgroundColor = '#666';
            }
        }

        // Событие нажатия на кнопку
        button.addEventListener('click', changeMusic);

