import { useState } from "react";
import {
  extraitDuJour,
  livreMemorisateur,
  motDuJour,
  sourceMotsDuCoran,
} from "@/data/coranQuotidien";

// En tête de la page Coran : extrait du jour et mot du Coran du jour.
// Chaque carte n'apparaît que si sa liste contient au moins un texte.
export function QuranDailyCards({ hidden }: { hidden?: boolean }) {
  const [today] = useState(() => new Date());
  const extrait = extraitDuJour(today);
  const mot = motDuJour(today);
  if (!extrait && !mot) return null;

  return (
    <div className={`grid gap-4 ${mot && extrait ? "lg:grid-cols-2" : ""}`} hidden={hidden}>
      {mot && (
        <figure className="n-card n-card-tint flex flex-col">
          <span className="n-label">Mot du Coran</span>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            {/* Seule la ponctuation finale est retirée ; la traduction est reprise telle quelle. */}
            <p className="n-display text-[20px] leading-snug">
              {mot.translation.replace(/[\s,.;:!»]+$/u, "")}
            </p>
            <p className="n-arabic text-[38px] leading-normal text-(--n-sage-dark)" lang="ar">
              {/* Signes de pause (waqf) retirés du mot isolé ; ils restent dans le verset. */}
              {mot.arabic.replace(/[ۖ-ۜ]/gu, "")}
            </p>
          </div>
          <div className="mt-3">
            <p className="n-arabic text-[19px] leading-[1.9]" lang="ar">
              {mot.verseArabic}
            </p>
            <p className="mt-1 text-[14px] leading-6 text-(--n-muted)">{mot.verseTranslation}</p>
          </div>
          <figcaption className="mt-auto pt-4 text-[13px] text-(--n-muted)">
            Sourate {mot.surah}, verset {mot.verse} · {sourceMotsDuCoran.titre},{" "}
            <a href={sourceMotsDuCoran.lien} target="_blank" rel="noreferrer" className="underline">
              {sourceMotsDuCoran.auteur}
            </a>
          </figcaption>
        </figure>
      )}
      {extrait && (
        <figure className="n-card n-rappel flex flex-col">
          <span className="n-label">Le comportement du mémorisateur</span>
          <blockquote className="n-rappel-text">{extrait.text}</blockquote>
          <figcaption className="mt-auto pt-4 text-[13px] text-(--n-muted)">
            <span className="font-semibold text-(--n-ink)">{livreMemorisateur.auteur}</span>
            {" · "}
            {livreMemorisateur.titre}, {extrait.page}
          </figcaption>
        </figure>
      )}
    </div>
  );
}
