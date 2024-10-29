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

const music = document.getElementById("background-music");
        const playButton = document.getElementById("play-music");

        // Функция для воспроизведения музыки
        function playMusic() {
            music.play().then(() => {
                playButton.style.display = 'none'; // Скрыть кнопку после успешного воспроизведения
            }).catch(error => {
                console.error("Не удалось воспроизвести музыку:", error);
                alert("Музыка не может быть воспроизведена автоматически. Попробуйте снова.");
            });
        }

// Настройка музыки
const backgroundMusic = document.getElementById("background-music");
backgroundMusic.volume = 0.2; // для громкости пониженной на фоне
