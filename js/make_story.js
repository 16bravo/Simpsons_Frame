let episodesData = [];
let allImages = [];
let currentImages = [];
let storyFrames = [];

fetch('data/episodes_data.json')
    .then(response => response.json())
    .then(data => {
        episodesData = data;
        episodesData.forEach(episode => {
            episode.images.forEach(image => {
                allImages.push({
                    src: `images/${episode.code.toUpperCase()}/${image}`,
                    code: episode.code
                });
            });
        });
        loadRandomImages();
    });

function loadRandomImages() {
    currentImages = allImages.sort(() => 0.5 - Math.random()).slice(0, 5);

    const imageContainer = document.getElementById('image-container');
    imageContainer.innerHTML = '';

    currentImages.forEach((image, index) => {
        const div = document.createElement('div');
        div.classList.add('image-item');
        div.dataset.index = index;
        div.innerHTML = `<img src="${image.src}" alt="Image ${index + 1}">`;
        div.addEventListener('click', () => selectImage(index));
        imageContainer.appendChild(div);
    });

    document.getElementById('caption-container').style.display = 'none';
}

function selectImage(index) {
    currentImages = [currentImages[index]];
    const imageContainer = document.getElementById('image-container');
    imageContainer.innerHTML = `
        <div class="image-item">
            <img src="${currentImages[0].src}" alt="Selected Image">
        </div>
    `;
    document.getElementById('caption-container').style.display = 'block';
}

function addFrame() {
    const caption = document.getElementById('caption-input').value;
    if (!caption.trim()) {
        alert('Please enter a caption.');
        return;
    }

    const imageSrc = currentImages[0].src;
    storyFrames.push({ imageSrc, caption });

    document.getElementById('caption-input').value = '';
    document.getElementById('caption-container').style.display = 'none';

    const storyContainer = document.getElementById('story-container');
    const div = document.createElement('div');
    div.classList.add('story-frame');
    div.innerHTML = `<img src="${imageSrc}" alt="Story Image"><div class="caption">${caption}</div>`;
    storyContainer.appendChild(div);

    loadRandomImages();
}

function concludeStory() {
    document.getElementById('image-container').style.display = 'none';
    document.getElementById('caption-container').style.display = 'none';
    document.querySelector('.button-container').style.display = 'none';
    document.getElementById('download-container').style.display = 'block';
}

function downloadStory() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const imageWidth = 300;
    const imageHeight = 240;
    const padding = 10;
    const captionHeight = 50;
    const columns = 3;

    canvas.width = (imageWidth + padding) * columns - padding;
    canvas.height = Math.ceil(storyFrames.length / columns) * (imageHeight + captionHeight + padding) - padding;

    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = "16px Arial";
    context.textAlign = "center";
    context.fillStyle = "#000000";

    storyFrames.forEach((frame, index) => {
        const img = new Image();
        img.src = frame.imageSrc;

        img.onload = () => {
            const x = (index % columns) * (imageWidth + padding);
            const y = Math.floor(index / columns) * (imageHeight + captionHeight + padding);

            context.drawImage(img, x, y, imageWidth, imageHeight);
            const words = frame.caption.split(' ');
            let line = '';
            const lineHeight = 20;
            let captionY = y + imageHeight + 20;

            words.forEach(word => {
                const testLine = line + word + ' ';
                const metrics = context.measureText(testLine);
                const testWidth = metrics.width;

                if (testWidth > imageWidth) {
                    context.fillText(line, x + imageWidth / 2, captionY);
                    line = word + ' ';
                    captionY += lineHeight;
                } else {
                    line = testLine;
                }
            });
            context.fillText(line, x + imageWidth / 2, captionY);

            if (index === storyFrames.length - 1) {
                const link = document.createElement('a');
                link.href = canvas.toDataURL();
                link.download = 'story.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };
    });
}

function resetStory() {
    storyFrames = [];
    document.getElementById('story-container').innerHTML = '';
    document.getElementById('image-container').style.display = 'flex';
    document.querySelector('.button-container').style.display = 'block';
    document.getElementById('download-container').style.display = 'none';
    loadRandomImages();
}

document.getElementById('caption-input').setAttribute('maxlength', '100');
