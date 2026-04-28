// Shared book data + design tokens

const TOKENS = {
  paper: '#f4efe6',
  paperDeep: '#ece5d6',
  ink: '#1a1612',
  inkSoft: '#3d362c',
  inkMute: '#7a6f5e',
  inkFaint: '#b8ad97',
  rule: 'rgba(26,22,18,0.12)',
  ruleStrong: 'rgba(26,22,18,0.22)',
  accent: '#7a2418',          // ox-blood
  accentSoft: '#a64a3a',
  serif: '"Cormorant Garamond", "EB Garamond", Georgia, serif',
  sans: '"Inter Tight", "Inter", -apple-system, sans-serif',
  mono: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
};

const STATUS = {
  'a-lire':     { label: 'À lire',     dot: '#b8ad97' },
  'en-cours':   { label: 'En cours',   dot: '#7a2418' },
  'lu':         { label: 'Lu',         dot: '#3d362c' },
  'abandonne':  { label: 'Abandonné',  dot: 'transparent', strike: true },
};

const BOOKS = [
  { n: '01', title: 'À la recherche du temps perdu',     author: 'Marcel Proust',         year: 1913, status: 'lu',        spineH: 0.92, spineColor: '#5d2a1f', spineText: '#e8d9b8', start: '12 janvier 2026',  end: '02 mars 2026',     source: 'Gallimard, coll. Folio', acquired: '2026-01-08',
    note: "Lu lentement, le matin. La phrase est une chambre où l'on s'attarde.",
    justif: "Relu pour la troisième fois. Le rythme me manquait." },
  { n: '02', title: 'Les Onze Mille Verges',             author: 'Guillaume Apollinaire', year: 1907, status: 'abandonne', spineH: 0.62, spineColor: '#1c1410', spineText: '#c9b888', acquired: '2025-09-22',
    note: "Difficile, peut-être plus tard.", justif: "Découvert par hasard. Inadapté au moment." },
  { n: '03', title: 'Bouvard et Pécuchet',               author: 'Gustave Flaubert',      year: 1881, status: 'en-cours',  spineH: 0.84, spineColor: '#2d3a2a', spineText: '#d4c89a', start: '08 avril 2026', source: 'Le Livre de Poche', acquired: '2026-04-04',
    note: "Page 142. Le passage sur le jardin.",
    justif: "Curiosité après Madame Bovary l'année dernière." },
  { n: '04', title: 'Aurélien',                          author: 'Louis Aragon',          year: 1944, status: 'a-lire',    spineH: 0.78, spineColor: '#7a2418', spineText: '#f4efe6', acquired: '2026-03-19',
    note: "", justif: "Recommandation de M. — premier amour de l'après-guerre." },
  { n: '05', title: 'Le Rivage des Syrtes',              author: 'Julien Gracq',          year: 1951, status: 'lu',        spineH: 0.71, spineColor: '#3a3025', spineText: '#bfa97a', start: '02 février 2026', end: '21 février 2026', acquired: '2026-01-30',
    note: "L'attente comme matière. À relire au bord de la mer.", justif: "" },
  { n: '06', title: "L'Œuvre au noir",                    author: 'Marguerite Yourcenar',  year: 1968, status: 'a-lire',    spineH: 0.88, spineColor: '#0f1f2a', spineText: '#c8b88a', acquired: '2026-04-12',
    note: "", justif: "Mentionné par J.-P. Dubois dans une interview." },
  { n: '07', title: 'Belle du Seigneur',                 author: 'Albert Cohen',          year: 1968, status: 'en-cours',  spineH: 0.96, spineColor: '#4a1818', spineText: '#e8c878', start: '18 mars 2026', acquired: '2026-03-14',
    note: "Très long. Je m'y replonge le soir.", justif: "" },
  { n: '08', title: 'Mémoires d\'Hadrien',               author: 'Marguerite Yourcenar',  year: 1951, status: 'lu',        spineH: 0.82, spineColor: '#5a4a2a', spineText: '#f0e4c0', start: '14 décembre 2025', end: '08 janvier 2026', acquired: '2025-12-09',
    note: "Lecture de fin d'année. Tenir le carnet ouvert.", justif: "" },
  { n: '09', title: 'La Modification',                   author: 'Michel Butor',          year: 1957, status: 'a-lire',    spineH: 0.66, spineColor: '#2a2018', spineText: '#a89878', acquired: '2026-02-05',
    note: "", justif: "Le 'vous' du nouveau roman — étudier la forme." },
  { n: '10', title: 'Les Choses',                        author: 'Georges Perec',         year: 1965, status: 'lu',        spineH: 0.58, spineColor: '#d4c89a', spineText: '#3a2818', start: '04 novembre 2025', end: '12 novembre 2025', acquired: '2025-10-30',
    note: "Une sociologie en creux. Premier chapitre exemplaire.", justif: "" },
];

const INBOX = [
  { title: "L'Établi",                  author: 'Robert Linhart',     year: 1978,
    src: 'France Culture — 18 avril 2026',
    why: "Cité dans une émission sur le travail à la chaîne. Un mois passé chez Citroën-Choisy, raconté sans pathos." },
  { title: 'Vies minuscules',           author: 'Pierre Michon',      year: 1984,
    src: 'La Grande Librairie — 14 avril 2026',
    why: "Évoqué par Annie Ernaux dans un entretien. Phrases longues, paysans du Limousin, langue très tenue." },
  { title: "L'Usage du monde",          author: 'Nicolas Bouvier',    year: 1963,
    src: 'Conversation — Léo, 09 avril 2026',
    why: "Mentionné après une discussion sur la lenteur du voyage. Genève → Khyber, en Fiat Topolino." },
  { title: 'La Salle de bain',          author: 'Jean-Philippe Toussaint', year: 1985,
    src: 'Le Matricule des Anges — n° 287',
    why: "Recensé dans un dossier sur le minimalisme romanesque. Premier livre, très court, très précis." },
  { title: 'Léon Morin, prêtre',        author: 'Béatrix Beck',       year: 1952,
    src: 'Podcast Bibliothèque Médicis — 02 avril 2026',
    why: "Prix Goncourt 1952, redécouvert récemment. Conversion, occupation, langue sèche." },
];

window.TOKENS = TOKENS;
window.STATUS = STATUS;
window.BOOKS = BOOKS;
window.INBOX = INBOX;
