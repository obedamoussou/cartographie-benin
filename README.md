# Bénin · Cartographie diplomatique

Globe 3D interactif qui lit en direct le Google Sheet « Cartographie coopéaration »
(onglets **Partenaires** et **Accords**).

## Utilisation
- Lancer en local : `python -m http.server 8000` dans ce dossier, puis ouvrir http://localhost:8000
- Héberger : déposer `index.html` sur GitHub Pages, Netlify, Vercel, etc. (un seul fichier).

## Mettre à jour les données
Il suffit de modifier le Google Sheet. La page se resynchronise toutes les 5 minutes
ou via le bouton « Actualiser ».
- Le Sheet doit rester partagé en « Tous les utilisateurs disposant du lien : lecteur ».
- Une ligne = un pays (nom en français : « Etats Unis », « Côte d'Ivoire », « RDC »… sont reconnus).
- « Niveau d'activité » : Elevé / Moyen / Faible → couleur du pays sur le globe.
- Les accords sont rattachés au pays via la colonne « Pays » de l'onglet Accords.
- Toute nouvelle colonne ajoutée au Sheet apparaît automatiquement dans la fiche (« Autres informations »).
- Dates au format JJ/MM/AAAA. « A préciser » s'affiche comme champ à compléter.

## Changer de Sheet
Modifier `SHEET_ID` et les `gid` des onglets en haut du script dans `index.html`.
