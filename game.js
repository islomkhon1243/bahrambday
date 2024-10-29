const glovesContainer = document.getElementById('gloves-container');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('start-button');
const endButton = document.getElementById('end-button');

let score = 0;
let gameActive = false;
let gloveInterval;

// Функция для старта игры
startButton.addEventListener('click', startGame);
endButton.addEventListener('click', endGame); // Добавьте обработчик для кнопки "Закончить игру"

function startGame() {
    score = 0;
    gameActive = true;
    scoreDisplay.textContent = score;
    glovesContainer.innerHTML = ''; // Очистить предыдущие перчатки

    startButton.disabled = true; // Отключить кнопку "Начать"
    endButton.style.display = 'inline'; // Показать кнопку "Закончить"

    gloveInterval = setInterval(() => {
        if (gameActive) {
            createGlove();
        }
    }, 1000); // Каждые 1 секунду появляется новая перчатка
}

// Функция для создания перчатки
function createGlove() {
    const glove = document.createElement('img');
    glove.src = 'images/glove.png'; // Укажите путь к изображению перчатки
    glove.classList.add('glove');
    glove.style.top = Math.random() * (glovesContainer.clientHeight - 80) + 'px'; // Случайное положение по вертикали
    glove.style.left = Math.random() * (glovesContainer.clientWidth - 80) + 'px'; // Случайное положение по горизонтали

    // Добавление обработчика клика на перчатку
    glove.addEventListener('click', () => {
        score++;
        scoreDisplay.textContent = score;
        glove.remove(); // Удалить перчатку при клике
    });

    glovesContainer.appendChild(glove);
}

// Функция для окончания игры
function endGame() {
    gameActive = false;
    clearInterval(gloveInterval);
    alert(`Игра окончена! Ваши очки: ${score}`);
    startButton.disabled = false; // Включить кнопку "Начать" снова
    endButton.style.display = 'none'; // Скрыть кнопку "Закончить"
}

// Инициализация при загрузке страницы
window.onload = () => {
    endButton.style.display = 'none'; // Скрыть кнопку "Закончить" изначально
};
