import os
import requests
import pandas as pd
from tqdm import tqdm

# Lire le fichier Excel
df = pd.read_excel('episodes.xlsx')

# Fonction pour télécharger une image
def download_image(url, save_path):
    response = requests.get(url)
    if response.status_code == 200:
        with open(save_path, 'wb') as f:
            f.write(response.content)
        return True
    else:
        return False

# Parcourir les codes des épisodes
for code in df['Code']:
    # Convertir le code en minuscule
    code_lower = code.lower()
    
    # Créer un répertoire pour chaque épisode
    episode_dir = os.path.join('images', code_lower)
    os.makedirs(episode_dir, exist_ok=True)

    frame_number = 1
    
    # On utilise tqdm pour afficher une barre de progression
    with tqdm(desc=f'Téléchargement de l\'épisode {code}', unit='image') as pbar:
        while True:
            frame_code = f'frame{frame_number:03d}.jpg'
            url = f'https://www.simpsonspark.com/framegrabs/{code_lower}/{frame_code}'
            save_path = os.path.join(episode_dir, frame_code)

            # Télécharger l'image
            if not download_image(url, save_path):
                break
            
            frame_number += 1
            pbar.update(1)  # Met à jour la barre de progression
