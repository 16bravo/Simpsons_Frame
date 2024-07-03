let episodesData = [];
let currentImages = [];
let currentEpisode = {};
let rankingScores = JSON.parse(localStorage.getItem('rankingScores')) || {};

fetch('data/episodes_data.json')
    .then(response => response.json())
    .then(data => {
        episodesData = data;
        initializeRankingScores();
        loadRandomImages();
        updateProgress();
    });

function initializeRankingScores() {
    episodesData.forEach(episode => {
        episode.images.forEach(image => {
            const key = `${episode.code}-${image}`;
            if (!rankingScores[key]) {
                rankingScores[key] = { elo: 1000, count: 0 };
            }
        });
    });
    localStorage.setItem('rankingScores', JSON.stringify(rankingScores));
}

function loadRandomImages() {
    currentEpisode = episodesData[Math.floor(Math.random() * episodesData.length)];
    const images = currentEpisode.images.sort(() => 0.5 - Math.random()).slice(0, 5);
    currentImages = images;

    document.getElementById('episode-title').innerText = currentEpisode.title;

    const imageContainer = document.getElementById('image-container');
    imageContainer.innerHTML = '';

    images.forEach((image, index) => {
        const key = `${currentEpisode.code}-${image}`;
        const elo = rankingScores[key].elo;

        const div = document.createElement('div');
        div.classList.add('image-item');
        div.dataset.index = index;
        div.innerHTML = `
            <div class="rank">Rang ${index + 1}</div>
            <img src="images/${currentEpisode.code}/${image}" alt="Image ${index + 1}">
            <div class="average">Elo: ${elo.toFixed(0)}</div>
        `;
        imageContainer.appendChild(div);
    });

    new Sortable(imageContainer, {
        animation: 150,
        onEnd: updateRanks
    });
}

function updateRanks() {
    const imageContainer = document.getElementById('image-container').children;
    Array.from(imageContainer).forEach((item, index) => {
        item.querySelector('.rank').innerText = `Rang ${index + 1}`;
    });
}

function submitRanking() {
    const imageContainer = document.getElementById('image-container').children;

    const elos = Array.from(imageContainer).map(item => {
        const imageIndex = item.dataset.index;
        const imageKey = `${currentEpisode.code}-${currentImages[imageIndex]}`;
        return rankingScores[imageKey].elo;
    });

    const minimum = parseInt(Math.min(...elos));
    const maximum = parseInt(Math.max(...elos));

    Array.from(imageContainer).forEach((item, index) => {
        const imageIndex = item.dataset.index;
        const imageKey = `${currentEpisode.code}-${currentImages[imageIndex]}`;
        const currentElo = rankingScores[imageKey].elo;

        const result = 1 - index / 4;
        const expected = (maximum - minimum === 0) ? 0.5 : (currentElo - minimum) / (maximum - minimum);
        //console.log(expected);
        const exchange = 40 * (result - expected);
        //console.log(exchange);

        rankingScores[imageKey].elo += exchange;
        //console.log(rankingScores[imageKey].elo);
        rankingScores[imageKey].count += 1;
    });

    localStorage.setItem('rankingScores', JSON.stringify(rankingScores));

    loadRandomImages();
    updateProgress();
}

function updateProgress() {
    const totalImages = Object.keys(rankingScores).length;
    const ratedImages = Object.values(rankingScores).filter(score => score.count > 0).length;
    const percentage = ((ratedImages / totalImages) * 100).toFixed(2);

    const progressDiv = document.getElementById('progress');
    progressDiv.innerHTML = `<p>${ratedImages} images notées sur ${totalImages} (${percentage}%)</p>`;
}

function downloadResults() {
    const rows = [['Code', 'Frame', 'Elo']];
    episodesData.forEach(episode => {
        episode.images.forEach(image => {
            const key = `${episode.code}-${image}`;
            const elo = rankingScores[key].elo.toFixed(0);
            rows.push([episode.code, image, elo]);
        });
    });

    let csvContent = "data:text/csv;charset=utf-8," 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "image_ranking_scores.csv");
    document.body.appendChild(link);
    link.click();
}
