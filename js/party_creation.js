let episodesData = [];
let currentImages = [];
let currentEpisode = {};
let guessConfigurations = JSON.parse(localStorage.getItem('guessConfigurations')) || {};

// Fonction pour générer un identifiant unique
function generateUniqueId() {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, function() {
        return (Math.random() * 16 | 0).toString(16);
    });
}

fetch('data/episodes_data.json')
    .then(response => response.json())
    .then(data => {
        episodesData = data;
        loadRandomImages();
    });

function loadRandomImages() {
    currentEpisode = episodesData[Math.floor(Math.random() * episodesData.length)];
    const images = currentEpisode.images.sort(() => 0.5 - Math.random()).slice(0, 5);
    currentImages = images;

    document.getElementById('episode-title').innerText = currentEpisode.title;

    const imageContainer = document.getElementById('image-container');
    imageContainer.innerHTML = '';

    images.forEach((image, index) => {
        const div = document.createElement('div');
        div.classList.add('image-item');
        div.dataset.index = index;
        div.innerHTML = `
            <div class="rank">Guess ${index + 1}</div>
            <img src="images/${currentEpisode.code.toUpperCase()}/${image}" alt="Image ${index + 1}">
            <button class="remove-button" onclick="removeImage(${index})">Retirer</button>
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
    currentImages = Array.from(imageContainer).map(item => {
        const imgSrc = item.querySelector('img').getAttribute('src');
        return imgSrc.substring(imgSrc.lastIndexOf('/') + 1);
    });
    
    Array.from(imageContainer).forEach((item, index) => {
        item.querySelector('.rank').innerText = `Guess ${index + 1}`;
    });

    console.log('Updated currentImages:', currentImages); // Log the updated currentImages
}

function removeImage(index) {
    const remainingImages = currentEpisode.images.filter(image => !currentImages.includes(image));
    const newImage = remainingImages[Math.floor(Math.random() * remainingImages.length)];
    currentImages[index] = newImage;

    const imageItem = document.querySelector(`.image-item[data-index='${index}']`);
    imageItem.querySelector('img').src = `images/${currentEpisode.code}/${newImage}`;

    updateRanks(); // Update ranks after removing and adding a new image
}

function submitGuess() {
    // Log current images before saving
    console.log('Submitting guess with currentImages:', currentImages);

    const uniqueId = generateUniqueId();

    guessConfigurations[uniqueId] = { episodeCode: currentEpisode.code, guesses: currentImages };

    localStorage.setItem('guessConfigurations', JSON.stringify(guessConfigurations));

    console.log('guessConfigurations after saving:', JSON.parse(localStorage.getItem('guessConfigurations'))); // Log saved configurations

    loadRandomImages();
}

function downloadConfigurations() {
    const storedConfigurations = JSON.parse(localStorage.getItem('guessConfigurations')) || {};
    console.log('Stored Configurations:', storedConfigurations); // Log stored configurations

    const rows = [['ID Unique', 'Code', 'Guess 1', 'Guess 2', 'Guess 3', 'Guess 4', 'Guess 5']];

    Object.keys(storedConfigurations).forEach(id => {
        const config = storedConfigurations[id];
        const row = [
            id,
            config.episodeCode,
            ...config.guesses
        ];
        rows.push(row);
    });

    console.log('CSV Rows:', rows); // Log CSV rows before generating the file

    let csvContent = "\uFEFF" + rows.map(e => e.join(",")).join("\n"); // Add BOM for UTF-8 encoding

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "guess_configurations.csv");
    document.body.appendChild(link);
    link.click();
}
