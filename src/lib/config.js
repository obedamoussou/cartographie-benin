/* =========================================================
   CONFIGURATION — identifiant du Google Sheet (doit être
   partagé en « Tous les utilisateurs disposant du lien »)
   ========================================================= */
export const SHEET_ID = '1wUaIkNMKlrOuMx7bmhRVy4GqiLMjSRnSoKs5wNtYzzY';
export const TABS = { partners: { name: 'Partenaires', gid: '0' }, accords: { name: 'Accords', gid: '882619615' } };
export const BENIN = { lat: 6.37, lng: 2.43, a2: 'BJ' }; // Cotonou

export const WORLD_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';
export const SKY_URL = 'https://cdn.jsdelivr.net/npm/three-globe@2.42.0/example/img/night-sky.png';
export const REFRESH_EVERY = 5 * 60 * 1000; // resynchronisation automatique toutes les 5 minutes

/* Copie de secours, utilisée si le Sheet est injoignable */
export const SNAPSHOT = {
  partners: [
    ['', 'Pays', ' Capitale', 'Types de représentation diplomatique', "Pays de résidence de l'ambassadeur(e)", "Nom et prenom de l'ambassadeur(e)", 'Date de nomination', 'Noms et prenoms des points focaux', 'Email des points focaux', 'Telephone des points focaux', 'Site officiel', 'Domaines de coopération', "Niveau d'activité de la relation", 'Nombre de projets financés à date', 'Montant mobilisé à date', 'Date de la dernière audience', 'Dernière actualité commune', 'Prochaine actualité à suivre', 'Date de la dernière interaction', 'Date de la prochaine interaction', 'Prochaines actions', 'Lien du dossier complet du partenaire'],
    ['', 'France', 'Paris', 'Ambassade', 'Benin', 'Nadège CHOUAT', '05/07/2024', 'A preciser', 'A preciser', 'A preciser', 'https://bj.diplomatie.gouv.fr/', 'Education et formation professionnelles, Enseignement supérieur et recherche, Culture et patrimoine, Agriculture et développement rural, Eau et Assainissement, Santé publique, Environnement et climat', 'Elevé', 'A préciser', 'A préciser', 'A preciser', 'Visite du président Romuald Wadagni en France le 04 Octobre 2026 et signature de trois accords de financement', 'Visite du président Emmanuel Macron au Benin dans le cadre de sa tournée africaine', 'A préciser', 'A préciser', 'A préciser', 'A préciser'],
    ['', 'Allemagne'], ['', 'Maroc'], ['', 'Afrique du Sud']
  ],
  accords: [
    ['', 'Pays', 'Institutions partenaires', "Intitulé de l'accord", 'Domaine de la coopération', 'Entité bénéficiaire', 'Date de démarrage', 'Date de fin', 'Nature ', 'Montant ', 'Résultats attendus', 'Statut'],
    ['', 'France ', 'AFD', "Appui à la modernisation du système d'information de la Direction Générale des Impots", 'Numérique et innovation', 'Direction Générale des Impots', '1/11/2022', '1/11/2027', 'Subvention', '2636947140', '', 'En cours'],
    ['', 'Allemagne'], ['', 'Etats Unis'], ['', 'Afrique du Sud']
  ]
};
