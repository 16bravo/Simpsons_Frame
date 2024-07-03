let episodesData = [];
let episodeTitles = [];
let currentEpisodeIndex = 0;
let gameFinished = false;

// Récupérer le paramètre de l'URL
const urlParams = new URLSearchParams(window.location.search);
const gameParam = parseInt(urlParams.get('game')) || 1;

// Charger les données des fichiers CSV et JSON
fetch('data/guess_configurations.csv')
    .then(response => response.text())
    .then(data => {
        episodesData = parseCSV(data);
        return fetch('data/episodes_data.json');
    })
    .then(response => response.json())
    .then(data => {
        episodesData.forEach(episode => {
            const matchingEpisode = data.find(e => e.code === episode.Code);
            episode.fullTitle = matchingEpisode ? matchingEpisode.title : '';
        });
        episodeTitles = data.map(episode => episode.title);
        populateEpisodeTitles();
        loadEpisode(gameParam - 1);
    });

// Fonction pour parser le CSV
function parseCSV(data) {
    const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.replace(/^"|"$/g, '')); // Remove surrounding quotes
        return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index].trim();
            return obj;
        }, {});
    });
}

// Fonction pour peupler la liste des titres d'épisodes
function populateEpisodeTitles() {
    const datalist = document.getElementById('episodeTitles');
    episodeTitles.forEach(title => {
        const option = document.createElement('option');
        option.value = title;
        datalist.appendChild(option);
    });
}

// Fonction pour charger un épisode en fonction de l'index
function loadEpisode(index) {
    currentEpisodeIndex = index;
    const episode = episodesData[index];
    const frames = [
        document.getElementById('frame1').querySelector('img'),
        document.getElementById('frame2').querySelector('img'),
        document.getElementById('frame3').querySelector('img'),
        document.getElementById('frame4').querySelector('img'),
        document.getElementById('frame5').querySelector('img')
    ];

    frames.forEach((frame, i) => {
        frame.src = `images/${episode.Code.toUpperCase()}/${episode[`Guess ${i + 1}`]}`;
    });

    let currentFrame = 0;
    gameFinished = false;
    const submitGuess = document.getElementById('submitGuess');
    const result = document.getElementById('result');
    const guessInput = document.getElementById('guess');

    const frameButtons = [
        document.getElementById('btn1'),
        document.getElementById('btn2'),
        document.getElementById('btn3'),
        document.getElementById('btn4'),
        document.getElementById('btn5')
    ];

    frameButtons.forEach((button, i) => {
        button.style.display = 'none'; // Masquer tous les boutons au début
    });

    frameButtons[0].style.display = 'inline-block'; // Afficher le premier bouton au début

    frameButtons.forEach((button, i) => {
        button.addEventListener('click', () => {
            showFrame(i);
        });
    });

    function showFrame(index) {
        frames.forEach((frame, i) => {
            frame.parentElement.classList.toggle('active', i === index);
        });
    }

    // Vérification des données stockées
    const savedState = getSavedState(currentEpisodeIndex);
    if (savedState) {
        currentFrame = savedState.currentFrame;
        gameFinished = savedState.gameFinished;
        if (gameFinished) {
            result.innerHTML = `Vous avez ${savedState.guessCorrect ? 'gagné' : 'perdu'}!<br><b>${episode.fullTitle}</b>`;
            frames.forEach(frame => frame.parentElement.classList.add('active'));
            frameButtons.forEach((button, i) => {
                button.style.display = 'inline-block'; // Afficher tous les boutons à la fin du jeu
                if (savedState.guessCorrect && i === savedState.guessFrame) {
                    button.style.backgroundColor = 'green';
                } else if (!savedState.guessCorrect && i === 4) {
                    button.style.backgroundColor = 'red';
                }
            });
            submitGuess.disabled = true;
        } else {
            for (let i = 0; i <= currentFrame; i++) {
                frames[i].parentElement.classList.add('active');
                frameButtons[i].style.display = 'inline-block'; // Afficher les boutons pour les guesses en cours
            }
            // Laisser les boutons masqués pour les guesses restants
            for (let i = currentFrame + 1; i < frameButtons.length; i++) {
                frameButtons[i].style.display = 'none';
            }
            showFrame(currentFrame);
        }
    } else {
        showFrame(0);
        frameButtons[0].style.display = 'inline-block'; // Afficher le premier bouton au début
    }

    submitGuess.addEventListener('click', () => {
        const guess = guessInput.value;
        guessInput.value = '';
        if (episodeTitles.includes(guess) && guess.toLowerCase() === episode.fullTitle.toLowerCase()) {
            result.innerHTML = `Bravo ! Vous avez deviné l'épisode.<br><b>${episode.fullTitle}</b>`;
            frames.forEach(frame => frame.parentElement.classList.add('active'));
            frameButtons.forEach(button => {
                button.style.display = 'inline-block'; // Afficher tous les boutons à la fin du jeu
            });
            submitGuess.disabled = true;
            gameFinished = true;
            markCorrectFrame(currentFrame);
            saveState(currentEpisodeIndex, currentFrame, true, currentFrame + 1);
        } else {
            currentFrame++;
            saveState(currentEpisodeIndex, currentFrame, false, -1);
            if (currentFrame < frames.length) {
                showFrame(currentFrame);
                frameButtons[currentFrame].style.display = 'inline-block'; // Afficher le bouton correspondant au nouveau guess
            } else {
                result.innerHTML = `Dommage ! Vous avez épuisé toutes les tentatives.<br><b>${episode.fullTitle}</b>`;
                submitGuess.disabled = true;
                gameFinished = true;
                markCorrectFrame(-1);
                saveState(currentEpisodeIndex, currentFrame, false, -1);
            }
        }
    });

    const prevLink = document.getElementById('prev');
    const nextLink = document.getElementById('next');
    prevLink.href = `?game=${Math.max(1, index)}`;
    nextLink.href = `?game=${Math.min(episodesData.length, index + 2)}`;

    if (index === 0) {
        prevLink.classList.add('disabled');
    } else {
        prevLink.classList.remove('disabled');
    }

    if (index === episodesData.length - 1) {
        nextLink.classList.add('disabled');
    } else {
        nextLink.classList.remove('disabled');
    }
}

function markCorrectFrame(frameNumber) {
    const frameButtons = [
        document.getElementById('btn1'),
        document.getElementById('btn2'),
        document.getElementById('btn3'),
        document.getElementById('btn4'),
        document.getElementById('btn5')
    ];

    frameButtons.forEach((button, index) => {
        if (index === frameNumber) {
            button.style.backgroundColor = 'green';
        } else {
            button.style.backgroundColor = '';
        }
    });
}

function saveState(index, currentFrame, guessCorrect, guessFrame) {
    const state = {
        currentFrame: currentFrame,
        gameFinished: gameFinished,
        guessCorrect: guessCorrect,
        guessFrame: guessFrame
    };
    localStorage.setItem(`episode_${index}_state`, JSON.stringify(state));
}

function getSavedState(index) {
    const state = localStorage.getItem(`episode_${index}_state`);
    return state ? JSON.parse(state) : null;
}

function getResult(index) {
    return localStorage.getItem(`episode_${index}_result`);
}
