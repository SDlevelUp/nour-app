// Rappels du jour affichés sur « Aujourd'hui » (décision du 2026-10-22).
// Uniquement des textes fournis par Sarah, avec leur source : rien n'est inventé ni généré.
// Le rappel change chaque jour à minuit et tourne dans l'ordre de la liste.
// Tant que la liste est vide, la carte n'apparaît pas.
import { itemOfTheDay } from "./dailyPick";

export type Rappel = {
  id: string;
  text: string; // traduction française
  arabic?: string; // texte original, facultatif
  author: string; // ex. « Ibn al-Qayyim »
  source: string; // livre, tome et page, ou lien
};

export const rappels: Rappel[] = [
  {
    id: "yahya-ibn-muadh-remedes-du-coeur",
    text: "Les remèdes pour le cœur sont au nombre de cinq : la lecture du Qur’an avec méditation, avoir le ventre vide, veiller la nuit en prière, les implorations aux dernières heures de la nuit et le fait de tenir compagnie aux vertueux.",
    author: "Yahya Ibn Mou’adh رحمه الله",
    source: "Sifat Safwa, v.4/p.341",
  },
];

export const rappelDuJour = (date: Date): Rappel | null => itemOfTheDay(rappels, date);
