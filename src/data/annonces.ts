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
