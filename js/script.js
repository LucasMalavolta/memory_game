// Variáveis globais do jogo
let gameBoard = document.getElementById('game-board');
let difficultySelect = document.getElementById('difficulty');
let startButton = document.getElementById('start-button');
let timerDisplay = document.getElementById('timer');
let gameResult = document.getElementById('game-result');
let finalTimeDisplay = document.getElementById('final-time');
let playAgainButton = document.getElementById('play-again');

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let gameStarted = false;
let gameTimer = null;
let startTime = null;
let currentDifficulty = 'basic'; // Armazenar a dificuldade atual

// Emojis para as cartas (adequados para crianças)
const cardSymbols = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
    '🦆', '🐧', '🦋', '🐝', '🐞', '🦄', '🌟', '⭐',
    '🌈', '🎈', '🎁', '🍎', '🍌', '🍓', '🍊', '🍇'
];

// Configurações dos níveis
const levelConfig = {
    basic: { rows: 2, cols: 4, pairs: 4 },
    intermediate: { rows: 3, cols: 4, pairs: 6 },
    advanced: { rows: 4, cols: 4, pairs: 8 }
};

// Event listeners
startButton.addEventListener('click', startGame);
playAgainButton.addEventListener('click', resetGame);

// Função para iniciar o jogo
function startGame() {
    const difficulty = difficultySelect.value;
    currentDifficulty = difficulty; // Salvar a dificuldade atual
    const config = levelConfig[difficulty];
    
    // Resetar variáveis
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    gameStarted = true;
    startTime = Date.now();
    
    // Configurar o tabuleiro
    setupBoard(config);
    
    // Iniciar o timer
    startTimer();
    
    // Esconder resultado anterior
    gameResult.classList.add('hidden');
    
    // Atualizar classe do tabuleiro para responsividade
    gameBoard.className = difficulty;
}

// Função para configurar o tabuleiro
function setupBoard(config) {
    // Limpar tabuleiro
    gameBoard.innerHTML = '';
    
    // Selecionar símbolos aleatórios
    const selectedSymbols = cardSymbols.slice(0, config.pairs);
    const gameSymbols = [...selectedSymbols, ...selectedSymbols]; // Duplicar para pares
    
    // Embaralhar as cartas
    shuffleArray(gameSymbols);
    
    // Criar as cartas
    gameSymbols.forEach((symbol, index) => {
        const card = createCard(symbol, index);
        cards.push(card);
        gameBoard.appendChild(card);
    });
}

// Função para criar uma carta
function createCard(symbol, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.symbol = symbol;
    card.dataset.index = index;
    
    card.innerHTML = `
        <div class="front-face">${symbol}</div>
        <div class="back-face"></div>
    `;
    
    card.addEventListener('click', () => flipCard(card));
    
    return card;
}

// Função para virar uma carta
function flipCard(card) {
    if (!gameStarted || card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length >= 2) {
        return;
    }
    
    card.classList.add('flipped');
    flippedCards.push(card);
    
    if (flippedCards.length === 2) {
        setTimeout(checkMatch, 600);
    }
}

// Função para verificar se as cartas combinam
function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.symbol === card2.dataset.symbol) {
        // Cartas combinam - manter viradas permanentemente
        card1.classList.add('matched');
        card2.classList.add('matched');
        // Não remover a classe 'flipped' para manter as cartas viradas
        matchedPairs++;
        
        // Verificar se o jogo terminou
        const totalPairs = levelConfig[currentDifficulty].pairs;
        if (matchedPairs === totalPairs) {
            endGame();
        }
    } else {
        // Cartas não combinam - virar de volta
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }
    
    flippedCards = [];
}

// Função para embaralhar array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Função para iniciar o timer
function startTimer() {
    // Timer roda em background sem exibir na tela
    gameTimer = setInterval(() => {
        // Timer continua rodando mas não atualiza a tela
    }, 1000);
}

// Função para parar o timer
function stopTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

// Função para obter mensagem de feedback baseada no tempo e dificuldade
function getFeedbackMessage(timeInSeconds, difficulty) {
    const messages = {
        basic: {
            excellent: "⭐️⭐️⭐️ Uau! Você é super rápido! Esse jogo tá muito fácil pra você, bora tentar o próximo desafio.",
            good: "⭐️⭐️ Ótimo! Tá indo muito bem. Se treinar mais, vai ficar rapidinho igual um foguete.",
            normal: "⭐️ Muito bem! Você tá ficando cada vez melhor! Continue treinando sua memória."
        },
        intermediate: {
            excellent: "⭐️⭐️⭐️ Uhuu! Que memória incrível! Esse nível ficou fácil pra você, bora tentar o avançado.",
            good: "⭐️⭐️ Muito bem! Só mais um pouco e você vai bater seu recorde.",
            normal: "⭐️ Muito bom! Sua memória tá ficando mais forte! Continue assim."
        },
        advanced: {
            excellent: "⭐️⭐️⭐️ Nossa! Você é um mestre da memória! Tá jogando muito rápido! Será que não tem superpoder escondido aí, hein?",
            good: "⭐️⭐️ Tá indo muito bem! Esse é o desafio dos campeões, e você tá ficando craque.",
            normal: "⭐️ Muito bom! Esse é um desafio bem difícil e você tá mandando muito bem! Continue treinando."
        }
    };

    let messageType;
    
    switch(difficulty) {
        case 'basic':
            if (timeInSeconds <= 20) messageType = 'excellent';
            else if (timeInSeconds <= 30) messageType = 'good';
            else messageType = 'normal';
            break;
        case 'intermediate':
            if (timeInSeconds <= 30) messageType = 'excellent';
            else if (timeInSeconds <= 45) messageType = 'good';
            else messageType = 'normal';
            break;
        case 'advanced':
            if (timeInSeconds < 60) messageType = 'excellent';
            else if (timeInSeconds <= 90) messageType = 'good';
            else messageType = 'normal';
            break;
    }
    
    return messages[difficulty][messageType];
}

// Função para terminar o jogo
function endGame() {
    gameStarted = false;
    stopTimer();
    
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const totalSeconds = Math.floor(elapsed / 1000);
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Obter mensagem de feedback personalizada
    const feedbackMessage = getFeedbackMessage(totalSeconds, currentDifficulty);
    
    finalTimeDisplay.textContent = timeString;
    
    // Atualizar o resultado com a mensagem personalizada
    const resultSection = document.getElementById('game-result');
    resultSection.innerHTML = `
        <h2>🎉 Parabéns! 🎉</h2>
        <p>Você completou o jogo em <strong>${timeString}</strong>!</p>
        <p class="feedback-message">${feedbackMessage}</p>
        <button id="play-again">🔄 Jogar Novamente</button>
    `;
    
    // Reativar o event listener do botão "Jogar Novamente"
    document.getElementById('play-again').addEventListener('click', resetGame);
    
    gameResult.classList.remove('hidden');
}

// Função para resetar o jogo
function resetGame() {
    stopTimer();
    gameStarted = false;
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    gameBoard.innerHTML = '';
    gameResult.classList.add('hidden');
    
    // Usar a dificuldade atual salva em vez de ler do select
    const config = levelConfig[currentDifficulty];
    
    // Resetar variáveis para novo jogo
    gameStarted = true;
    startTime = Date.now();
    
    // Configurar o tabuleiro com a mesma dificuldade
    setupBoard(config);
    
    // Iniciar o timer
    startTimer();
    
    // Atualizar classe do tabuleiro para responsividade
    gameBoard.className = currentDifficulty;
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('Jogo da Memória carregado!');
});

