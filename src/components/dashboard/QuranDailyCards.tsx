import { useState } from "react";
import { extraitDuJour, livreMemorisateur, motDuJour } from "@/data/coranQuotidien";

// En tête de la page Coran : extrait du jour et mot du Coran du jour.
// Chaque carte n'apparaît que si sa liste contient au moins un texte.
export function QuranDailyCards({ hidden }: { hidden?: boolean }) {
  const [today] = useState(() => new Date());
  const extrait = extraitDuJour(today);
  const mot = motDuJour(today);
  if (!extrait && !mot) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2" hidden={hidden}>
      {mot && (
        <figure className="n-card n-card-tint flex flex-col">
          <span className="n-label">Mot du Coran</span>
          <p className="n-arabic mt-3 text-[36px] leading-[1.6] text-(--n-sage-dark)" lang="ar">
            {mot.arabic}
          </p>
          <p className="n-display text-[20px]">{mot.transliteration}</p>
          <p className="mt-2 text-[15px] leading-6">{mot.meaning}</p>
          <figcaption className="mt-auto pt-4 text-[13px] text-(--n-muted)">
            {mot.verse && <>{mot.verse} · </>}
            {mot.source}
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
