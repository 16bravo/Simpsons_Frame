let episodesData = [];
let currentImages = [];
let currentEpisode = {};
let eloScores = JSON.parse(localStorage.getItem('eloScores')) || {};

fetch('data/episodes_data.json')
    .then(response => response.json())
    .then(data => {
        episodesData = data;
        initializeEloScores();
        loadRandomImages();
    });

function initializeEloScores() {
    episodesData.forEach(episode => {
        episode.images.forEach(image => {
            const key = `${episode.code}-${image}`;
            if (!eloScores[key]) {
                eloScores[key] = 1000;
            }
        });
    });
    localStorage.setItem('eloScores', JSON.stringify(eloScores));
}

function loadRandomImages() {
    currentEpisode = episodesData[Math.floor(Math.random() * episodesData.length)];
    const images = currentEpisode.images.sort(() => 0.5 - Math.random()).slice(0, 2);
    currentImages = images;

    document.getElementById('episode-title').innerText = currentEpisode.title;
    document.getElementById('image1').src = `images/${currentEpisode.code}/${images[0]}`;
    document.getElementById('image2').src = `images/${currentEpisode.code}/${images[1]}`;
    document.getElementById('elo1').innerText = `Elo: ${Math.round(eloScores[`${currentEpisode.code}-${images[0]}`])}`;
    document.getElementById('elo2').innerText = `Elo: ${Math.round(eloScores[`${currentEpisode.code}-${images[1]}`])}`;
}

function vote(result) {
    const image1Key = `${currentEpisode.code}-${currentImages[0]}`;
    const image2Key = `${currentEpisode.code}-${currentImages[1]}`;

    const elo1 = eloScores[image1Key];
    const elo2 = eloScores[image2Key];

    const expectedScore1 = 1 / (1 + 10 ** ((elo2 - elo1) / 400));
    const expectedScore2 = 1 / (1 + 10 ** ((elo1 - elo2) / 400));

    const score1 = result;
    const score2 = 1 - result;

    eloScores[image1Key] = elo1 + 40 * (score1 - expectedScore1);
    eloScores[image2Key] = elo2 + 40 * (score2 - expectedScore2);

    localStorage.setItem('eloScores', JSON.stringify(eloScores));

    loadRandomImages();
}

function downloadResults() {
    const rows = [['Code', 'Frame', 'Elo']];
    episodesData.forEach(episode => {
        episode.images.forEach(image => {
            const key = `${episode.code}-${image}`;
            rows.push([episode.code, image, Math.round(eloScores[key])]);
        });
    });

    let csvContent = "data:text/csv;charset=utf-8," 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "image_elo_scores.csv");
    document.body.appendChild(link);
    link.click();
}
