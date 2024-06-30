const startButton = document.getElementById('start');
const submitButton = document.getElementById('submit');
const textElement = document.getElementById('text');
const inputElement = document.getElementById('input');
const timerElement = document.getElementById('timer');
const resultElement = document.getElementById('result');
const levelSelect = document.getElementById('level');
const recordsTable = document.getElementById('recordsTable').getElementsByTagName('tbody')[0];
const clearHistoryButton = document.getElementById('clearHistory');
let startTime;
let timerInterval;
let levelSelected = false;
let typingStarted = false;

const texts = {
    beginner: "The quick brown fox jumps over the lazy dog",
    intermediate: "Typing is a fundamental skill for computer literacy",
    advanced: "Advanced typing tests involve complex sentences with punctuation"
};

function loadRecords() {
    const records = JSON.parse(localStorage.getItem('typingRecords')) || [];
    records.forEach(record => addRecordToTable(record.level, record.time, record.wpm, record.accuracy));
}

function saveRecord(level, time, wpm, accuracy) {
    const records = JSON.parse(localStorage.getItem('typingRecords')) || [];
    records.push({ level, time, wpm, accuracy });
    localStorage.setItem('typingRecords', JSON.stringify(records));
}

function clearHistory() {
    localStorage.removeItem('typingRecords');
    recordsTable.innerHTML = ''; // Clear the table content visually
}

levelSelect.addEventListener('change', () => {
    if (typingStarted) {
        alert('Please complete the typing test before changing the level.');
        levelSelect.value = levelSelect.dataset.previousValue; // Revert to previous value
    } else {
        if (!levelSelected) {
            levelSelected = true;
        }
        textElement.textContent = texts[levelSelect.value];
    }
});

startButton.addEventListener('click', () => {
    if (levelSelect.value === 'Select Level') {
        alert('Please select a level before starting.');
        return;
    }

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
        resultElement.textContent = `Text does not match. Please try again. Accuracy: ${accuracy.toFixed(2)}%`;
    }

    inputElement.disabled = true;
    submitButton.disabled = true;
    levelSelect.disabled = false;
    levelSelected = false;
    typingStarted = false;
});

clearHistoryButton.addEventListener('click', () => {
    clearHistory();
});

document.addEventListener('DOMContentLoaded', () => {
    textElement.textContent = texts[levelSelect.value];
    loadRecords();
});

function addRecord(level, time, wpm, accuracy) {
    addRecordToTable(level, time, wpm, accuracy);
    saveRecord(level, time, wpm, accuracy);
}

function addRecordToTable(level, time, wpm, accuracy) {
    const row = recordsTable.insertRow();
    row.insertCell(0).textContent = level;
    row.insertCell(1).textContent = time;
    row.insertCell(2).textContent = wpm;
    row.insertCell(3).textContent = accuracy + "%";
}

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
