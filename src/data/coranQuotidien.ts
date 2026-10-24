// Contenus quotidiens de la page Coran (décision du 2026-10-24).
// Uniquement des textes fournis par Sarah depuis ses livres, avec la page :
// rien n'est inventé ni généré. Tant qu'une liste est vide, sa carte n'apparaît pas.
import { itemOfTheDay } from "./dailyPick";
import { motsDuCoranNonnenmacher } from "./motsDuCoranNonnenmacher";

// Extraits de « Le comportement du mémorisateur du Coran » (an-Nawawi, éd. avec Ibn Badis).
// Droit de citation : extraits courts, toujours avec la page.
export type ExtraitMemorisateur = {
  id: string;
  text: string;
  page: string; // ex. « p. 42 »
};

export const livreMemorisateur = {
  titre: "Le comportement du mémorisateur du Coran",
  auteur: "an-Nawawi",
  edition: "[À CONFIRMER : éditeur, traducteur et année de l’édition de Sarah]",
};

export const extraitsMemorisateur: ExtraitMemorisateur[] = [];

// Mot du Coran du jour : traduction mot à mot du Dr Usama Nonnenmacher
// (https://github.com/DrUsamaN/CoranMot), reprise sans modification, source citée.
export type MotDuCoran = {
  id: string;
  arabic: string;
  translation: string;
  surah: number;
  verse: number;
  verseArabic: string;
  verseTranslation: string;
};

export const sourceMotsDuCoran = {
  titre: "Traduction mot à mot du Coran",
  auteur: "Dr Usama Nonnenmacher",
  lien: "https://github.com/DrUsamaN/CoranMot",
};

export const extraitDuJour = (date: Date) => itemOfTheDay(extraitsMemorisateur, date);
export const motDuJour = (date: Date) => itemOfTheDay(motsDuCoranNonnenmacher, date);
