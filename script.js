// Game State
let gameState = {
    mode: 'classic',
    pairs: 8,
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    timer: 0,
    timerInterval: null,
    isPlaying: false,
    hints: 3, // Будет меняться в зависимости от сложности
    canUseHint: true,
    selectedCards: [],
    settings: {
        theme: 'default',
        volume: 50,
        language: 'ru'
    }
};

// Language Texts
const texts = {
    ru: {
        gameTitle: "CLASH OF CARDS",
        author: "from ALI_Good_Gaming",
        play: "Играть",
        records: "Рекорды",
        settings: "Настройки",
        back: "Назад",
        classicMode: "Классический",
        timedMode: "На время",
        classicDescription: "Найдите все пары карт в своем темпе. Выберите количество пар от 8 до 25.",
        timedDescription: "Найдите все пары карт за ограниченное время. Ваш результат будет сохранен.",
        selectMode: "Выберите режим игры",
        gameSettings: "Настройки игры",
        pairsCount: "Количество пар",
        customize: "Настройте сами",
        startGame: "Начать игру!",
        remainingPairs: "Осталось пар",
        moves: "Ходы",
        time: "Время",
        hints: "Подсказки",
        hint: "Подсказка",
        finish: "Завершить",
        gameComplete: "Игра завершена!",
        mode: "Режим:",
        date: "Дата:",
        saveResult: "Сохранить результат",
        enterName: "Введите ваше имя",
        mainMenu: "В главное меню",
        recordsTitle: "Таблица рекордов",
        clearRecords: "Очистить рекорды",
        settingsTitle: "Настройки игры",
        theme: "Тема игры",
        sound: "Звук",
        language: "Язык",
        social: "Мои соц сети"
    },
    en: {
        gameTitle: "CLASH OF CARDS",
        author: "from ALI_Good_Gaming",
        play: "Play",
        records: "Records",
        settings: "Settings",
        back: "Back",
        classicMode: "Classic",
        timedMode: "Timed",
        classicDescription: "Find all card pairs at your own pace. Choose from 8 to 25 pairs.",
        timedDescription: "Find all card pairs against the clock. Your result will be saved.",
        selectMode: "Select Game Mode",
        gameSettings: "Game Settings",
        pairsCount: "Number of Pairs",
        customize: "Customize",
        startGame: "Start Game!",
        remainingPairs: "Pairs Left",
        moves: "Moves",
        time: "Time",
        hints: "Hints",
        hint: "Hint",
        finish: "Finish",
        gameComplete: "Game Complete!",
        mode: "Mode:",
        date: "Date:",
        saveResult: "Save Result",
        enterName: "Enter your name",
        mainMenu: "Main Menu",
        recordsTitle: "Records Table",
        clearRecords: "Clear Records",
        settingsTitle: "Game Settings",
        theme: "Game Theme",
        sound: "Sound",
        language: "Language",
        social: "My Social Media"
    }
};

// Initialize the game
function init() {
    loadSettings();
    loadRecords();
    updateLanguage();
    
    // Set initial screen
    showScreen('mainMenu');
    updateHeader();
}

// Update header based on screen
function updateHeader() {
    const currentScreen = document.querySelector('.screen.active').id;
    
    if (currentScreen === 'mainMenu') {
        document.getElementById('mainHeader').style.display = 'flex';
        document.getElementById('backHeader').style.display = 'none';
    } else {
        document.getElementById('mainHeader').style.display = 'none';
        document.getElementById('backHeader').style.display = 'flex';
    }
}

// Screen management
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected screen
    document.getElementById(screenId).classList.add('active');
    
    // Update header
    updateHeader();
    
    // Special handling for specific screens
    if (screenId === 'gameBoard') {
        startGameTimer();
    } else if (screenId === 'recordsScreen') {
        displayRecords();
    } else if (screenId === 'mainMenu') {
        // Reset game state when returning to main menu
        stopGameTimer();
        gameState.isPlaying = false;
    }
}

function goBack() {
    const currentScreen = document.querySelector('.screen.active').id;
    
    switch(currentScreen) {
        case 'modeSelection':
        case 'recordsScreen':
        case 'settingsScreen':
            showScreen('mainMenu');
            break;
        case 'gameSettings':
            showScreen('modeSelection');
            break;
        case 'gameBoard':
            if (confirm(gameState.settings.language === 'ru' ? 
                'Завершить текущую игру?' : 'Finish current game?')) {
                endGame(false);
            }
            break;
        case 'resultsScreen':
            showScreen('mainMenu');
            break;
    }
}

// Mode selection
function selectMode(mode) {
    gameState.mode = mode;
    const title = document.getElementById('settingsModeTitle');
    title.textContent = gameState.settings.language === 'ru' ? 'Настройки игры' : 'Game Settings';
    showScreen('gameSettings');
}

// Game settings
function selectSize(pairs) {
    gameState.pairs = pairs;
    document.getElementById('pairsValue').textContent = pairs;
    document.getElementById('pairsRange').value = pairs;
    
    // Update selected visual
    document.querySelectorAll('.size-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const sizeOptions = document.querySelectorAll('.size-option');
    if (pairs === 8) sizeOptions[0].classList.add('selected');
    else if (pairs === 15) sizeOptions[1].classList.add('selected');
    else if (pairs === 25) sizeOptions[2].classList.add('selected');
}

function updatePairsValue() {
    const slider = document.getElementById('pairsRange');
    const value = parseInt(slider.value);
    gameState.pairs = value;
    document.getElementById('pairsValue').textContent = value;
    
    // Update selected visual
    document.querySelectorAll('.size-option').forEach(option => {
        option.classList.remove('selected');
    });
}

// Game logic
function startGame() {
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.timer = 0;
    
    // Set hints based on difficulty
    if (gameState.pairs <= 8) {
        gameState.hints = 3;
    } else if (gameState.pairs <= 15) {
        gameState.hints = 4;
    } else {
        gameState.hints = 5;
    }
    
    gameState.flippedCards = [];
    gameState.selectedCards = [];
    gameState.isPlaying = true;
    gameState.canUseHint = true;
    
    // Update UI
    document.getElementById('remainingPairs').textContent = gameState.pairs;
    document.getElementById('movesCount').textContent = '0';
    document.getElementById('timer').textContent = '00:00';
    document.getElementById('hintsCount').textContent = gameState.hints;
    
    // Add pulse animation to stats
    ['remainingPairs', 'movesCount', 'timer', 'hintsCount'].forEach(id => {
        const element = document.getElementById(id);
        element.classList.add('pulse');
        setTimeout(() => element.classList.remove('pulse'), 500);
    });
    
    // Generate cards
    generateCards();
    
    // Show game board
    showScreen('gameBoard');
}

function generateCards() {
    const container = document.getElementById('cardsContainer');
    container.innerHTML = '';
    
    // Generate array of card numbers (1-50)
    const allCards = Array.from({length: 50}, (_, i) => i + 1);
    
    // Shuffle and select required number of cards
    const selectedCards = shuffleArray(allCards).slice(0, gameState.pairs);
    
    // Duplicate to create pairs and shuffle
    gameState.cards = shuffleArray([...selectedCards, ...selectedCards]);
    
    // Calculate grid size
    let columns, rows;
    if (gameState.pairs === 8) {
        columns = 4;
        rows = 4;
    } else if (gameState.pairs === 15) {
        columns = 6;
        rows = 5;
    } else if (gameState.pairs === 25) {
        columns = 10;
        rows = 5;
    } else {
        // For custom sizes, calculate optimal grid
        columns = Math.ceil(Math.sqrt(gameState.pairs * 2));
        rows = Math.ceil((gameState.pairs * 2) / columns);
    }
    
    container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    
    // Create card elements
    gameState.cards.forEach((cardId, index) => {
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'card-wrapper';
        cardWrapper.dataset.index = index;
        cardWrapper.dataset.cardId = cardId;
        
        cardWrapper.onclick = () => flipCard(index);
        
        const cardBack = document.createElement('div');
        cardBack.className = 'card card-back';
        
        const cardFront = document.createElement('div');
        cardFront.className = 'card card-front';
        cardFront.style.backgroundImage = `url('cards/${cardId}.png')`;
        
        cardWrapper.appendChild(cardBack);
        cardWrapper.appendChild(cardFront);
        
        container.appendChild(cardWrapper);
    });
}

function flipCard(index) {
    if (!gameState.isPlaying) return;
    
    const cardWrapper = document.querySelector(`.card-wrapper[data-index="${index}"]`);
    const cardId = parseInt(cardWrapper.dataset.cardId);
    
    // Don't allow flipping if: card is already flipped, two cards are already flipped, or card is matched
    if (cardWrapper.classList.contains('flipped') || 
        cardWrapper.classList.contains('matched') ||
        gameState.flippedCards.length >= 2) {
        return;
    }
    
    // Flip the card
    cardWrapper.classList.add('flipped');
    gameState.flippedCards.push({index, cardId});
    
    // Enable hint if one card is flipped
    if (gameState.flippedCards.length === 1) {
        gameState.canUseHint = true;
    }
    
    // Check for match
    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        
        // Add pulse animation to moves counter
        const movesElement = document.getElementById('movesCount');
        movesElement.textContent = gameState.moves;
        movesElement.classList.add('pulse');
        setTimeout(() => movesElement.classList.remove('pulse'), 500);
        
        const [card1, card2] = gameState.flippedCards;
        
        if (card1.cardId === card2.cardId) {
            // Match found
            setTimeout(() => {
                const card1Wrapper = document.querySelector(`.card-wrapper[data-index="${card1.index}"]`);
                const card2Wrapper = document.querySelector(`.card-wrapper[data-index="${card2.index}"]`);
                
                card1Wrapper.classList.add('matched');
                card2Wrapper.classList.add('matched');
                
                gameState.matchedPairs++;
                
                // Add pulse animation to remaining pairs counter
                const pairsElement = document.getElementById('remainingPairs');
                pairsElement.textContent = gameState.pairs - gameState.matchedPairs;
                pairsElement.classList.add('pulse');
                setTimeout(() => pairsElement.classList.remove('pulse'), 500);
                
                gameState.flippedCards = [];
                
                // Disable hint until next card is flipped
                gameState.canUseHint = false;
                
                // Check for win
                if (gameState.matchedPairs === gameState.pairs) {
                    setTimeout(() => endGame(true), 500);
                }
            }, 600);
        } else {
            // No match
            setTimeout(() => {
                const card1Wrapper = document.querySelector(`.card-wrapper[data-index="${card1.index}"]`);
                const card2Wrapper = document.querySelector(`.card-wrapper[data-index="${card2.index}"]`);
                
                card1Wrapper.classList.remove('flipped');
                card2Wrapper.classList.remove('flipped');
                
                gameState.flippedCards = [];
                
                // Enable hint again
                gameState.canUseHint = false;
            }, 1000);
        }
    }
}

function useHint() {
    if (!gameState.isPlaying || gameState.hints <= 0 || !gameState.canUseHint || gameState.flippedCards.length !== 1) {
        // Show message if hint cannot be used
        const message = gameState.settings.language === 'ru' 
            ? 'Откройте одну карту для использования подсказки' 
            : 'Open one card to use hint';
        alert(message);
        return;
    }
    
    gameState.hints--;
    
    // Add pulse animation to hints counter
    const hintsElement = document.getElementById('hintsCount');
    hintsElement.textContent = gameState.hints;
    hintsElement.classList.add('pulse');
    setTimeout(() => hintsElement.classList.remove('pulse'), 500);
    
    // Get the currently flipped card
    const flippedCard = gameState.flippedCards[0];
    const flippedCardId = flippedCard.cardId;
    
    // Find the matching card
    let matchingCardIndex = -1;
    gameState.cards.forEach((cardId, index) => {
        if (cardId === flippedCardId && index !== flippedCard.index) {
            matchingCardIndex = index;
        }
    });
    
    if (matchingCardIndex !== -1) {
        // Highlight the matching card
        const matchingCard = document.querySelector(`.card-wrapper[data-index="${matchingCardIndex}"]`);
        
        if (matchingCard && !matchingCard.classList.contains('flipped') && !matchingCard.classList.contains('matched')) {
            matchingCard.classList.add('hint-active');
            
            // Flip the card after a delay
            setTimeout(() => {
                matchingCard.classList.remove('hint-active');
                flipCard(matchingCardIndex);
            }, 1500);
        }
    }
    
    // Disable hint until next card is flipped
    gameState.canUseHint = false;
}

// Timer functions
function startGameTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timer = 0;
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timer / 60);
    const seconds = gameState.timer % 60;
    const timerElement = document.getElementById('timer');
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Add subtle pulse every 10 seconds
    if (gameState.timer % 10 === 0) {
        timerElement.classList.add('pulse');
        setTimeout(() => timerElement.classList.remove('pulse'), 300);
    }
}

function stopGameTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// Game end
function endGame(isWin = false) {
    gameState.isPlaying = false;
    stopGameTimer();
    
    if (isWin) {
        createConfetti();
        
        // Update results screen
        document.getElementById('resultMode').textContent = 
            gameState.mode === 'classic' ? 
            (gameState.settings.language === 'ru' ? 'Классический' : 'Classic') :
            (gameState.settings.language === 'ru' ? 'На время' : 'Timed');
        
        document.getElementById('resultTime').textContent = 
            document.getElementById('timer').textContent;
        
        document.getElementById('resultMoves').textContent = gameState.moves;
        
        const now = new Date();
        document.getElementById('resultDate').textContent = 
            now.toLocaleDateString(gameState.settings.language === 'ru' ? 'ru-RU' : 'en-US');
        
        // Show name input only for timed mode
        const nameInputContainer = document.getElementById('nameInputContainer');
        nameInputContainer.style.display = gameState.mode === 'timed' ? 'block' : 'none';
        
        showScreen('resultsScreen');
    } else {
        showScreen('mainMenu');
    }
}

// Results and records
function saveResult() {
    if (gameState.mode !== 'timed') {
        showScreen('mainMenu');
        return;
    }
    
    const playerName = document.getElementById('playerName').value || 
        (gameState.settings.language === 'ru' ? 'Игрок' : 'Player');
    
    const record = {
        name: playerName,
        mode: gameState.mode,
        time: gameState.timer,
        moves: gameState.moves,
        pairs: gameState.pairs,
        date: new Date().toISOString()
    };
    
    saveRecord(record);
    showScreen('recordsScreen');
}

function saveRecord(record) {
    const records = JSON.parse(localStorage.getItem('clashOfCardsRecords') || '[]');
    records.push(record);
    
    // Sort by time (ascending) for timed mode
    records.sort((a, b) => {
        if (a.mode === 'timed' && b.mode === 'timed') {
            return a.time - b.time;
        }
        return 0;
    });
    
    // Keep only top 20 records
    if (records.length > 20) {
        records.length = 20;
    }
    
    localStorage.setItem('clashOfCardsRecords', JSON.stringify(records));
}

function loadRecords() {
    return JSON.parse(localStorage.getItem('clashOfCardsRecords') || '[]');
}

function displayRecords() {
    const records = loadRecords();
    const recordsList = document.getElementById('recordsList');
    
    if (records.length === 0) {
        recordsList.innerHTML = `<div style="text-align: center; padding: 40px; color: #aaa;">
            ${gameState.settings.language === 'ru' ? 'Пока нет рекордов!' : 'No records yet!'}
        </div>`;
        return;
    }
    
    let html = '';
    records.forEach((record, index) => {
        const date = new Date(record.date);
        const minutes = Math.floor(record.time / 60);
        const seconds = record.time % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const modeText = record.mode === 'classic' ? 
            (gameState.settings.language === 'ru' ? 'Классический' : 'Classic') : 
            (gameState.settings.language === 'ru' ? 'На время' : 'Timed');
        
        html += `
            <div class="record-item">
                <div style="font-size: 1.5rem; font-weight: bold; color: ${index < 3 ? '#ffd700' : '#fff'}">#${index + 1}</div>
                <div style="font-size: 1.2rem;">${record.name}</div>
                <div><strong>${timeStr}</strong><br><small>${modeText}</small></div>
                <div>${date.toLocaleDateString(gameState.settings.language === 'ru' ? 'ru-RU' : 'en-US')}</div>
            </div>
        `;
    });
    
    recordsList.innerHTML = html;
}

function clearRecords() {
    if (confirm(gameState.settings.language === 'ru' ? 
        'Очистить все рекорды?' : 'Clear all records?')) {
        localStorage.removeItem('clashOfCardsRecords');
        displayRecords();
    }
}

// Settings
function loadSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('clashOfCardsSettings'));
    if (savedSettings) {
        gameState.settings = {...gameState.settings, ...savedSettings};
    }
    
    // Apply theme
    selectTheme(gameState.settings.theme, true);
    
    // Apply volume
    document.getElementById('volumeSlider').value = gameState.settings.volume;
    document.getElementById('volumeValue').textContent = gameState.settings.volume;
    
    // Apply language
    const langOptions = document.querySelectorAll('.language-option');
    langOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.textContent === (gameState.settings.language === 'ru' ? 'Русский' : 'English')) {
            option.classList.add('selected');
        }
    });
}

function saveSettings() {
    localStorage.setItem('clashOfCardsSettings', JSON.stringify(gameState.settings));
}

function selectTheme(theme, initial = false) {
    gameState.settings.theme = theme;
    
    const themes = {
        default: {primary: '#6a11cb', secondary: '#2575fc', accent: '#ff416c'},
        red: {primary: '#ff416c', secondary: '#ff4b2b', accent: '#6a11cb'},
        green: {primary: '#11998e', secondary: '#38ef7d', accent: '#ff416c'},
        orange: {primary: '#f46b45', secondary: '#eea849', accent: '#6a11cb'},
        purple: {primary: '#8e2de2', secondary: '#4a00e0', accent: '#ff416c'}
    };
    
    const colors = themes[theme];
    
    // Update CSS variables
    document.documentElement.style.setProperty('--primary-color', colors.primary);
    document.documentElement.style.setProperty('--secondary-color', colors.secondary);
    document.documentElement.style.setProperty('--accent-color', colors.accent);
    
    // Update selected visual
    if (!initial) {
        document.querySelectorAll('.theme-color').forEach(color => {
            color.classList.remove('selected');
        });
        
        const themeColors = document.querySelectorAll('.theme-color');
        const themeIndex = ['default', 'red', 'green', 'orange', 'purple'].indexOf(theme);
        if (themeIndex !== -1) {
            themeColors[themeIndex].classList.add('selected');
        }
        
        saveSettings();
    }
}

function updateVolume() {
    const volume = parseInt(document.getElementById('volumeSlider').value);
    gameState.settings.volume = volume;
    document.getElementById('volumeValue').textContent = volume;
    saveSettings();
}

function selectLanguage(lang) {
    gameState.settings.language = lang;
    updateLanguage();
    saveSettings();
}

function updateLanguage() {
    const lang = gameState.settings.language;
    const t = texts[lang];
    
    // Update specific elements
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) subtitle.textContent = t.author;
    
    // Update buttons in main menu
    const playBtn = document.querySelector('.menu-buttons .btn:nth-child(1)');
    if (playBtn) playBtn.innerHTML = `<i class="fas fa-play-circle"></i> ${t.play}`;
    
    const recordsBtn = document.querySelector('.menu-buttons .btn:nth-child(2)');
    if (recordsBtn) recordsBtn.innerHTML = `<i class="fas fa-trophy"></i> ${t.records}`;
    
    const settingsBtn = document.querySelector('.menu-buttons .btn:nth-child(3)');
    if (settingsBtn) settingsBtn.innerHTML = `<i class="fas fa-cog"></i> ${t.settings}`;
    
    // Update back button
    const backBtn = document.querySelector('.btn-back');
    if (backBtn) backBtn.innerHTML = `<i class="fas fa-arrow-left"></i> ${t.back}`;
    
    // Update mode selection
    const modeTitle = document.querySelector('.mode-title');
    if (modeTitle) modeTitle.textContent = t.selectMode;
    
    // Update game settings
    const settingsTitle = document.querySelector('.settings-title');
    if (settingsTitle) settingsTitle.textContent = t.gameSettings;
    
    // Update results screen
    const resultsTitle = document.querySelector('.results-title');
    if (resultsTitle) resultsTitle.textContent = t.gameComplete;
    
    // Update records screen
    const recordsTitle = document.querySelector('.records-title');
    if (recordsTitle) recordsTitle.textContent = t.recordsTitle;
    
    // Update settings screen
    const settingsScreenTitle = document.querySelector('#settingsScreen .settings-title');
    if (settingsScreenTitle) settingsScreenTitle.textContent = t.settingsTitle;
    
    // Update social media title
    const socialTitle = document.querySelector('.social-title');
    if (socialTitle) socialTitle.textContent = t.social;
}

// Utility functions
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function createConfetti() {
    const container = document.getElementById('confettiContainer');
    container.innerHTML = '';
    
    const colors = [
        getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
        '#ffd700', '#ffffff', '#00ff00'
    ];
    
    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.backgroundColor = color;
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        
        const animationDuration = Math.random() * 3 + 2;
        confetti.style.animation = `fall ${animationDuration}s linear forwards`;
        
        container.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
        }, animationDuration * 1000);
    }
}

// Initialize game when page loads
window.onload = init;
