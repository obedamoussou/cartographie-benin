# Bénin · Cartographie diplomatique

Globe 3D interactif (React + Vite) qui lit en direct le Google Sheet « Cartographie coopéaration »
(onglets **Partenaires** et **Accords**).

## Utilisation
- Installer : `npm install`
- Lancer en local : `npm run dev`, puis ouvrir l'adresse affichée (http://localhost:5173)
- Construire : `npm run build` → le site statique est généré dans `dist/`
- Héberger : déposer le contenu de `dist/` sur GitHub Pages, Netlify, Vercel, etc.

## Structure
- `src/App.jsx` — assemblage de l'interface et état (sélection, filtre, actualisation)
- `src/components/` — globe, panneau latéral, recherche, fiche pays
- `src/lib/` — configuration, lecture des données, utilitaires, correspondance des pays
- `src/styles.css` — styles

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
Modifier `SHEET_ID` et les `gid` des onglets dans `src/lib/config.js`.
