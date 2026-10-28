// Annonces affichées dans la cloche du dashboard (décision du 2026-10-21 :
// fichier dans l'app, une annonce = un déploiement). La plus récente en premier.
// `id` doit rester unique et ne jamais changer : il sert à savoir ce qui a été lu.
export type Annonce = {
  id: string;
  date: string; // AAAA-MM-JJ
  title: string;
  text: string;
};

export const annonces: Annonce[] = [
  {
    id: "2026-10-28-page-connexion",
    date: "2026-10-28",
    title: "Connexion plus simple",
    text: "La page de connexion affiche le nom Rawdah, explique que ton espace est créé dès ton premier code et donne des messages clairs en cas de souci. Au retour de Google, « Connexion en cours… » s’affiche au lieu d’un écran en anglais.",
  },
  {
    id: "2026-10-28-connexion-email",
    date: "2026-10-28",
    title: "Connexion par e-mail",
    text: "Plus besoin de compte Google : entre ton adresse e-mail, tu reçois un code de Rawdah et ton espace est créé dès le premier code. Pense à regarder tes spams.",
  },
  {
    id: "2026-10-28-science-modifier",
    date: "2026-10-28",
    title: "Corrige tes séances et tes fiches",
    text: "Dans Science bénéfique, un lien « Modifier » permet de corriger une séance ou une fiche (matn, hadith). Livres et Apprentissage montrent aussi un résumé à droite, comme Séances.",
  },
  {
    id: "2026-10-27-nouveau-calendrier",
    date: "2026-10-27",
    title: "Un calendrier plus doux",
    text: "Pour choisir une date (rappel de révision, journal du Coran, Science), un nouveau calendrier s’ouvre, en français, semaine du lundi au dimanche, et suit le mode nuit.",
  },
  {
    id: "2026-10-27-matn-en-arabe",
    date: "2026-10-27",
    title: "Ton matn en arabe",
    text: "Dans Science bénéfique, une fiche matn accepte maintenant le texte arabe, une portion par ligne, avec ta traduction sous chaque portion si tu veux.",
  },
  {
    id: "2026-10-27-cartes-sans-ombre",
    date: "2026-10-27",
    title: "Cartes sans ombre",
    text: "Les cartes n’ont plus d’ombre, et la carte « Reprendre la lecture » n’a plus de trait : l’écran est plus net et plus calme.",
  },
  {
    id: "2026-10-27-menu-haut-notifications",
    date: "2026-10-27",
    title: "Menu et nouveautés mieux placés",
    text: "Sur téléphone, le bouton menu en haut ouvre toutes les pages dans un panneau en bas de l’écran, et la fenêtre des nouveautés tient dans l’écran.",
  },
  {
    id: "2026-10-27-logo-mobile",
    date: "2026-10-27",
    title: "Un menu en haut sur téléphone",
    text: "Sur téléphone, le bouton menu en haut à gauche ouvre toutes les pages, et le logo Rawdah, au centre, ramène à « Aujourd’hui ».",
  },
  {
    id: "2026-10-26-rawdah",
    date: "2026-10-26",
    title: "Nour devient Rawdah",
    text: "L’application change de nom. Ton compte, tes notes et tes réglages ne changent pas.",
  },
  {
    id: "2026-10-24-cartes-sans-bordure",
    date: "2026-10-24",
    title: "Cartes épurées",
    text: "Les cartes n’ont plus de contour, et celles de la page Cycle s’alignent.",
  },
  {
    id: "2026-10-24-reprendre-la-lecture",
    date: "2026-10-24",
    title: "Reprends tes lectures",
    text: "Sur « Aujourd’hui », la même carte montre où tu en es dans le Coran et ton livre de science en cours.",
  },
  {
    id: "2026-10-24-sans-taches-du-jour",
    date: "2026-10-24",
    title: "Écran Aujourd’hui allégé",
    text: "Le module « Tâches du jour » est retiré. Tes tâches restent dans Notes, onglet « À faire ».",
  },
  {
    id: "2026-10-24-semaine-5-jours",
    date: "2026-10-24",
    title: "Planning plus lisible",
    text: "Sur ordinateur, la vue Semaine montre 5 jours à la fois. Les flèches font défiler les autres jours.",
  },
  {
    id: "2026-10-24-planning-pulse",
    date: "2026-10-24",
    title: "La prochaine activité se repère d’un coup d’œil",
    text: "Dans Planning, le rond de la prochaine activité pulse doucement.",
  },
  {
    id: "2026-10-24-rappel-etudiant",
    date: "2026-10-24",
    title: "Un rappel pour l’étudiant",
    text: "En haut de Science bénéfique : un passage de « La parure de l’étudiant en science religieuse » de Bakr Abou Zayd.",
  },
  {
    id: "2026-10-24-mot-du-coran",
    date: "2026-10-24",
    title: "Un mot du Coran chaque jour",
    text: "En haut de la page Coran : un mot, sa traduction et le verset où il apparaît, d’après la traduction mot à mot du Dr Usama Nonnenmacher.",
  },
  {
    id: "2026-10-22-ville-et-mosquees",
    date: "2026-10-22",
    title: "Choisis ta ville, trouve une mosquée",
    text: "Dans Réglages : recherche une ville pour tes horaires de prière, ou affiche les mosquées proches avec l’itinéraire.",
  },
  {
    id: "2026-10-22-textes",
    date: "2026-10-22",
    title: "Textes réécrits",
    text: "Page d’accueil, menu et notifications de rappel : textes plus courts et plus précis.",
  },
  {
    id: "2026-10-22-priere-et-rappel",
    date: "2026-10-22",
    title: "Prière et rappel côte à côte",
    text: "Sur « Aujourd’hui », la prochaine prière et le rappel du jour se lisent d’un seul regard.",
  },
  {
    id: "2026-10-22-modifier-les-regles",
    date: "2026-10-22",
    title: "Modifie tes règles jour par jour",
    text: "Dans Cycle, touche « Modifier les règles », coche ou décoche les jours dans le calendrier, puis « Enregistrer les nouvelles règles ».",
  },
  {
    id: "2026-10-22-calendrier-cycle",
    date: "2026-10-22",
    title: "Un calendrier du cycle plus lisible",
    text: "Plus grand, avec des jours ronds et une page Cycle réorganisée pour tout voir d’un coup d’œil.",
  },
  {
    id: "2026-10-22-rappel-du-jour",
    date: "2026-10-22",
    title: "Un rappel chaque jour",
    text: "Une parole des pieux prédécesseurs, avec sa source, apparaît sur ton écran « Aujourd’hui ».",
  },
  {
    id: "2026-10-21-nouveau-menu",
    date: "2026-10-21",
    title: "Un menu plus léger",
    text: "La barre latérale passe en rail d’icônes, et ton profil se trouve désormais en haut à droite.",
  },
  {
    id: "2026-10-19-coran-en-fond",
    date: "2026-10-19",
    title: "Le Coran continue pendant la navigation",
    text: "Lance une sourate puis change de page : une petite fenêtre te permet de mettre en pause, de passer au verset ou à la sourate suivante.",
  },
  {
    id: "2026-10-19-adhkar",
    date: "2026-10-19",
    title: "9 adhkar le matin et le soir",
    text: "Chaque invocation affiche son rapporteur, ses recueils et son degré d’authenticité dans « Preuve ».",
  },
  {
    id: "2026-10-19-horaires",
    date: "2026-10-19",
    title: "Horaires de prière ajustés",
    text: "Nouveau calcul des horaires : Fajr et Isha à 15°, Maghrib 4 minutes après le coucher du soleil.",
  },
];
