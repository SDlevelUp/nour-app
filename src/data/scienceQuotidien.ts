// Rappel du jour de la page Science bénéfique (décision du 2026-10-24).
// Uniquement des passages fournis par Sarah, avec l'auteur et le livre :
// rien n'est inventé ni généré. Tant que la liste est vide, la carte n'apparaît pas.
import { itemOfTheDay } from "./dailyPick";

export type PassageScience = {
  id: string;
  text: string;
  author: string;
  book: string;
  page?: string; // ex. « p. 42 », si Sarah l'a fournie
};

export const passagesScience: PassageScience[] = [
  {
    id: "bakr-abou-zayd-bruit-et-agitation",
    text: "Se préserver du bruit et de l’agitation, car l’erreur se cache derrière le tumulte, sans compter le fait que cela va à l’encontre du comportement de l’étudiant [en science religieuse].",
    author: "Bakr Abou Zayd",
    book: "La parure de l’étudiant en science religieuse",
    // [À CONFIRMER : page]
  },
];

export const passageScienceDuJour = (date: Date) => itemOfTheDay(passagesScience, date);
