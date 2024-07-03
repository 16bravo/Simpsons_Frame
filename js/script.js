let episodesData = [];

fetch('data/episodes_data.json')
    .then(response => response.json())
    .then(data => {
        episodesData = data;
        populateEpisodeTitles();
        startGame();
    });

function populateEpisodeTitles() {
    const datalist = document.getElementById('episodeTitles');
    episodesData.forEach(episode => {
        const option = document.createElement('option');
        option.value = episode.title;
        datalist.appendChild(option);
    });
}

function startGame() {
    const randomEpisode = episodesData[Math.floor(Math.random() * episodesData.length)];
    const episodeImages = randomEpisode.images.sort(() => 0.5 - Math.random()).slice(0, 5);
    const episodeTitle = randomEpisode.title;

    const frames = [
        document.getElementById('frame1').querySelector('img'),
        document.getElementById('frame2').querySelector('img'),
        document.getElementById('frame3').querySelector('img'),
        document.getElementById('frame4').querySelector('img'),
        document.getElementById('frame5').querySelector('img')
    ];

    frames.forEach((frame, index) => {
        frame.src = `images/${randomEpisode.code}/${episodeImages[index]}`;
    });

    let currentFrame = 0;
    let gameFinished = false; // Variable pour suivre l'état du jeu
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

    frameButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            showFrame(index); // Afficher les frames même après la fin du jeu
        });
    });

    function showFrame(index) {
        frames.forEach((frame, i) => {
            frame.parentElement.classList.toggle('active', i === index);
        });
        if (!gameFinished) {
            frameButtons.forEach((button, i) => {
                button.disabled = i > currentFrame;
            });
        }
    }

    showFrame(0);

    submitGuess.addEventListener('click', () => {
        const guess = guessInput.value;
        guessInput.value = ''; // Vider l'input texte après soumission
        if (guess.toLowerCase() === episodeTitle.toLowerCase()) {
            result.innerHTML = "Bravo ! Vous avez deviné l'épisode.</br><b>" + episodeTitle + "</b>";
            frames.forEach(frame => frame.parentElement.classList.add('active'));
            frameButtons.forEach(button => button.disabled = false); // Activer tous les boutons
            submitGuess.disabled = true;
            gameFinished = true; // Marquer la fin du jeu
        } else {
            currentFrame++;
            if (currentFrame < frames.length) {
                showFrame(currentFrame);
            } else {
                result.innerHTML = "Dommage ! Vous avez épuisé toutes les tentatives.</br><b>" + episodeTitle + "</b>";
                submitGuess.disabled = true;
                gameFinished = true; // Marquer la fin du jeu
            }
        }
    });
}
