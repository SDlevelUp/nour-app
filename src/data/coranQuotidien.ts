// Contenus quotidiens de la page Coran (décision du 2026-10-24).
// Uniquement des textes fournis par Sarah depuis ses livres, avec la page :
// rien n'est inventé ni généré. Tant qu'une liste est vide, sa carte n'apparaît pas.
import { itemOfTheDay } from "./dailyPick";

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

// Mot du Coran avec sa signification, tirée d'un livre de référence.
export type MotDuCoran = {
  id: string;
  arabic: string; // ex. « الرَّحْمَٰن »
  transliteration: string; // ex. « Ar-Raḥmân »
  meaning: string; // définition recopiée du livre
  verse?: string; // ex. « al-Fâtiha (1:3) »
  source: string; // livre, auteur et page
};

export const motsDuCoran: MotDuCoran[] = [];

export const extraitDuJour = (date: Date) => itemOfTheDay(extraitsMemorisateur, date);
export const motDuJour = (date: Date) => itemOfTheDay(motsDuCoran, date);
