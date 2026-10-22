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
    text: "Les horaires suivent désormais les réglages de la mosquée Al-Houda d’Antony (Fajr et Isha à 15°, Maghrib + 4 min).",
  },
];
