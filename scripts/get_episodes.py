import pandas as pd
import os
import random
import json

# Lire le fichier Excel
df = pd.read_excel('episodes.xlsx')

# Créer une structure de données pour stocker les informations sur les épisodes
episodes_data = []

for _, episode in df.iterrows():
    episode_code = episode['Code'].lower()
    episode_title = episode['Titre']

     # Extraire les informations de saison et épisode
    season = f'{int(episode["S"]):02d}'
    episode_num = f'{int(episode["E"]):02d}'
    season_episode = f'S{season}E{episode_num}'
    
    # Chemin où les images sont stockées
    images_path = f'./images/{episode_code}'
    images = os.listdir(images_path)
    
    episodes_data.append({
        'code': episode_code,
        'title': season_episode + ' - ' + episode_title,
        'images': images
    })

# Sauvegarder les données dans un fichier JSON
with open('data/episodes_data.json', 'w') as json_file:
    json.dump(episodes_data, json_file, indent=4)