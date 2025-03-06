const startButton = document.getElementById('start');
const submitButton = document.getElementById('submit');
const textElement = document.getElementById('text');
const inputElement = document.getElementById('input');
const timerElement = document.getElementById('timer');
const resultElement = document.getElementById('result');
const levelSelect = document.getElementById('level');
const recordsTable = document.getElementById('recordsTable').getElementsByTagName('tbody')[0];
const clearHistoryButton = document.getElementById('clearHistory');
const restartButton = document.getElementById('restart');
const toggleSoundButton = document.getElementById('toggleSound');
const clickSound = document.getElementById('clickSound');
const typingSound = document.getElementById('typingSound');

let startTime;
let timerInterval;
let levelSelected = false;
let typingStarted = false;
let soundEnabled = true;

const texts = {
    beginner: "The quick brown fox jumps over the lazy dog",
    intermediate: "Typing is a fundamental skill for computer literacy",
    advanced: "Advanced typing tests involve complex sentences with punctuation"
};

// Load records and initialize the text on page load
document.addEventListener('DOMContentLoaded', () => {
    textElement.textContent = texts[levelSelect.value] || "";
    loadRecords();
});

// Toggle sound feature
toggleSoundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    alert(`Sound ${soundEnabled ? 'enabled' : 'disabled'}`);
});

// Play click sound on mouse clicks
document.addEventListener('click', () => {
    if (soundEnabled) {
        clickSound.currentTime = 0; // Reset to start
        clickSound.play();
    }
});

// Play typing sound for each key press in the input area
inputElement.addEventListener('keypress', () => {
    if (soundEnabled) {
        typingSound.currentTime = 0; // Reset to start
        typingSound.play();
    }
});

// Handle level selection changes
levelSelect.addEventListener('change', () => {
    if (typingStarted) {
        alert('Please complete the typing test before changing the level.');
        levelSelect.value = levelSelect.dataset.previousValue || "Select Level";
    } else {
        levelSelected = true;
        textElement.textContent = texts[levelSelect.value] || "";
    }
});

// Start button functionality
startButton.addEventListener('click', () => {
    if (levelSelect.value === 'Select Level') {
        document.getElementById('level-alert').style.display = 'block';
        return;
    }

    document.getElementById('level-alert').style.display = 'none';
    levelSelected = true;
    typingStarted = true;

    levelSelect.disabled = true;
    levelSelect.dataset.previousValue = levelSelect.value;
    inputElement.value = '';
    inputElement.disabled = false;
    submitButton.disabled = false;
    inputElement.focus();
    resultElement.textContent = '';
    timerElement.textContent = 'Time: 0.00 seconds';
    startTime = new Date().getTime();

    timerInterval = setInterval(() => {
        const currentTime = new Date().getTime();
        const timeElapsed = ((currentTime - startTime) / 1000).toFixed(2);
        timerElement.textContent = `Time: ${timeElapsed} seconds`;
    }, 100);
});

// Handle typing validation
inputElement.addEventListener('input', () => {
    if (!textElement.textContent.startsWith(inputElement.value)) {
        clearInterval(timerInterval);
        inputElement.disabled = true;
        submitButton.disabled = true;
        resultElement.textContent = 'Text does not match. Please try again.';
        showRestartButton();
        typingStarted = false;
    }
});

// Submit button functionality
submitButton.addEventListener('click', () => {
    clearInterval(timerInterval);
    const currentTime = new Date().getTime();
    const timeTaken = (currentTime - startTime) / 1000;
    const wordsTyped = inputElement.value.trim().split(/\s+/).length;
    const wordsPerMinute = (wordsTyped / timeTaken) * 60;
    const accuracy = calculateAccuracy(textElement.textContent, inputElement.value.trim());

    if (inputElement.value.trim() === textElement.textContent) {
        resultElement.textContent = `Time taken: ${timeTaken.toFixed(2)} seconds. Words per minute: ${wordsPerMinute.toFixed(2)}. Accuracy: ${accuracy.toFixed(2)}%`;
        addRecord(levelSelect.value, timeTaken.toFixed(2), wordsPerMinute.toFixed(2), accuracy.toFixed(2));
    } else {
        resultElement.textContent = `Text does not match. Please try again.`;
    }

    showRestartButton();
    inputElement.disabled = true;
    submitButton.disabled = true;
    levelSelect.disabled = false;
    levelSelected = false;
    typingStarted = false;
});

// Restart button functionality
restartButton.addEventListener('click', resetTest);

// Clear history button functionality
clearHistoryButton.addEventListener('click', () => {
    const records = JSON.parse(localStorage.getItem('typingRecords')) || [];
    if (records.length === 0) {
        alert('No records to clear!');
    } else {
        clearHistory();
    }
});

// Load saved records from local storage
function loadRecords() {
    const records = JSON.parse(localStorage.getItem('typingRecords')) || [];
    records.forEach(record => addRecordToTable(record.level, record.time, record.wpm, record.accuracy));
}

// Save a record to local storage
function saveRecord(level, time, wpm, accuracy) {
    const records = JSON.parse(localStorage.getItem('typingRecords')) || [];
    records.push({ level, time, wpm, accuracy });
    localStorage.setItem('typingRecords', JSON.stringify(records));
}

// Add a record to the table
function addRecord(level, time, wpm, accuracy) {
    addRecordToTable(level, time, wpm, accuracy);
    saveRecord(level, time, wpm, accuracy);
}

// Add a record visually to the table
function addRecordToTable(level, time, wpm, accuracy) {
    const row = recordsTable.insertRow();
    row.insertCell(0).textContent = level;
    row.insertCell(1).textContent = time;
    row.insertCell(2).textContent = wpm;
    row.insertCell(3).textContent = accuracy + "%";
}

// Clear all saved records
function clearHistory() {
    localStorage.removeItem('typingRecords');
    recordsTable.innerHTML = '';
}

// Reset the typing test
function resetTest() {
    inputElement.value = '';
    resultElement.textContent = '';
    timerElement.textContent = 'Time: 0.00 seconds';
    restartButton.style.display = 'none';
    inputElement.disabled = false;
    submitButton.disabled = true;
    typingStarted = false;
    textElement.textContent = texts[levelSelect.value] || "";
}

// Calculate typing accuracy
function calculateAccuracy(originalText, typedText) {
    const originalWords = originalText.split(/\s+/);
    const typedWords = typedText.split(/\s+/);
    let correctWords = 0;

    originalWords.forEach((word, index) => {
        if (typedWords[index] && typedWords[index] === word) {
            correctWords++;
        }
    });

    return (correctWords / originalWords.length) * 100 || 0;
}

// Show the restart button
function showRestartButton() {
    restartButton.style.display = 'block';
}
