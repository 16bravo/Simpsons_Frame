document.addEventListener('DOMContentLoaded', function() {
    // Récupération des données depuis le localStorage
    const gamesPlayed = localStorage.length; // Nombre total de parties jouées
    let gamesWon = 0; // Initialisation du nombre de parties gagnées
    const guessDistribution = { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }; // Initialisation de la distribution des guess
  
    // Parcours des clés du localStorage pour calculer les statistiques
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('episode_')) {
        const state = JSON.parse(localStorage.getItem(key));
        if (state.gameFinished && state.guessCorrect) {
          gamesWon++;
        }
        if (state.guessFrame !== -1) {
          // Incrémenter la distribution de guess en utilisant l'index correctement
          guessDistribution[state.guessFrame + 1] = (guessDistribution[state.guessFrame + 1] || 0) + 1;
        }
      }
    }
  
    // Calcul du pourcentage de parties gagnées
    const winPercentage = (gamesWon / gamesPlayed * 100).toFixed(1) + '%';
  
    // Affichage des statistiques dans le DOM
    const gamesPlayedElement = document.getElementById('gamesPlayed');
    gamesPlayedElement.textContent = gamesPlayed;
  
    const gamesWonElement = document.getElementById('gamesWon');
    gamesWonElement.textContent = gamesWon;
  
    const winPercentageElement = document.getElementById('winPercentage');
    winPercentageElement.textContent = winPercentage;
  
    // Affichage de la distribution des guess
    const guessChart = document.getElementById('guessChart');
  
    Object.keys(guessDistribution).forEach(guessNumber => {
      const bar = document.createElement('div');
      bar.classList.add('bar');
  
      const label = document.createElement('span');
      label.classList.add('label');
      label.textContent = `Guess ${guessNumber-1}:`;
  
      const fill = document.createElement('div');
      fill.classList.add('fill');
      fill.style.width = `${guessDistribution[guessNumber] * 10}px`; // Ajustement de la largeur de la barre en fonction du nombre de guess
  
      const fillPercentage = document.createElement('span');
      fillPercentage.classList.add('fillPercentage');
      fillPercentage.textContent = `${guessDistribution[guessNumber]}`;
  
      bar.appendChild(label);
      bar.appendChild(fill);
      bar.appendChild(fillPercentage);
  
      guessChart.appendChild(bar);
    });
  });
  