import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

type LearningKind = "matn" | "hadith";
type LearningStatus = Doc<"scienceLearningItems">["status"];

const statusLabel: Record<LearningStatus, string> = {
  "to-learn": "À apprendre",
  learning: "En cours",
  memorized: "Mémorisé",
};

const todo = "À compléter";

export function LearningModule() {
  const items = useQuery(api.scienceLearning.list, {});
  const addItem = useMutation(api.scienceLearning.add);
  const updateStatus = useMutation(api.scienceLearning.setStatus);
  const updateReviewDate = useMutation(api.scienceLearning.setReviewDate);
  const removeItem = useMutation(api.scienceLearning.remove);
  const [kind, setKind] = useState<LearningKind>("matn");
  const [title, setTitle] = useState("");
  const [portions, setPortions] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [arabic, setArabic] = useState("");
  const [transliteration, setTransliteration] = useState("");
  const [translation, setTranslation] = useState("");
  const [narrator, setNarrator] = useState("");
  const [collection, setCollection] = useState("");
  const [number, setNumber] = useState("");
  const [grade, setGrade] = useState("");
  const [gradingSource, setGradingSource] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  const clearForm = () => {
    setTitle("");
    setPortions("");
    setReviewDate("");
    setArabic("");
    setTransliteration("");
    setTranslation("");
    setNarrator("");
    setCollection("");
    setNumber("");
    setGrade("");
    setGradingSource("");
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending("new");
    try {
      await addItem({
        kind,
        title,
        status: "to-learn",
        portions: kind === "matn" ? portions.split("\n") : [],
        reviewDate: kind === "matn" ? reviewDate || undefined : undefined,
        arabic: kind === "hadith" ? arabic || undefined : undefined,
        transliteration:
          kind === "hadith" ? transliteration || undefined : undefined,
        translation: kind === "hadith" ? translation || undefined : undefined,
        narrator: kind === "hadith" ? narrator || undefined : undefined,
        collection: kind === "hadith" ? collection || undefined : undefined,
        number: kind === "hadith" ? number || undefined : undefined,
        grade: kind === "hadith" ? grade || undefined : undefined,
        gradingSource:
          kind === "hadith" ? gradingSource || undefined : undefined,
      });
      clearForm();
      toast.success("Fiche enregistrée.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d’enregistrer la fiche.");
    } finally {
      setPending(null);
    }
  };

  const changeStatus = async (itemId: Id<"scienceLearningItems">, status: LearningStatus) => {
    setPending(itemId);
    try {
      await updateStatus({ itemId, status });
    } catch {
      toast.error("Impossible de modifier le statut.");
    } finally {
      setPending(null);
    }
  };

  const changeReviewDate = async (itemId: Id<"scienceLearningItems">, reviewDate: string) => {
    setPending(itemId);
    try {
      await updateReviewDate({ itemId, reviewDate: reviewDate || undefined });
    } catch {
      toast.error("Impossible d’enregistrer ce rappel.");
    } finally {
      setPending(null);
    }
  };

  const deleteItem = async (itemId: Id<"scienceLearningItems">) => {
    if (!window.confirm("Supprimer cette fiche ?")) return;
    setPending(itemId);
    try {
      await removeItem({ itemId });
    } catch {
      toast.error("Impossible de supprimer la fiche.");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-5">
      <details className="n-card" open={items !== undefined && items.length === 0}>
        <summary className="cursor-pointer">
          <span className="n-display text-[20px]">Nouvelle fiche</span>
          <span className="mt-1 block text-[15px] text-(--n-muted)">
            Un matn à apprendre par portions, ou un hadith à documenter. Nour ne fournit
            aucun contenu ici : complète chaque fiche avec un contenu vérifié.
          </span>
        </summary>
        <form onSubmit={(event) => void save(event)} className="mt-5 space-y-4">
          <div className="n-seg" role="group" aria-label="Type de fiche">
            <button type="button" aria-pressed={kind === "matn"} onClick={() => setKind("matn")}>
              Matn à apprendre
            </button>
            <button type="button" aria-pressed={kind === "hadith"} onClick={() => setKind("hadith")}>
              Hadith à documenter
            </button>
          </div>
          <label className="grid gap-1 text-[13px] font-semibold">
            {kind === "matn" ? "Titre du matn" : "Titre ou repère de la fiche"}
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              required
              className="n-input"
            />
          </label>

          {kind === "matn" ? (
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
              <label className="grid gap-1 text-[13px] font-semibold">
                Portions (une par ligne)
                <textarea
                  value={portions}
                  onChange={(event) => setPortions(event.target.value)}
                  placeholder={todo}
                  maxLength={10000}
                  className="n-input n-textarea font-normal"
                />
              </label>
              <label className="grid content-start gap-1 text-[13px] font-semibold">
                Rappel de révision (facultatif)
                <input
                  type="date"
                  value={reviewDate}
                  onChange={(event) => setReviewDate(event.target.value)}
                  className="n-input"
                />
              </label>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ["Texte arabe", arabic, setArabic],
                ["Translittération", transliteration, setTransliteration],
                ["Traduction française", translation, setTranslation],
                ["Rapporteur", narrator, setNarrator],
                ["Recueil", collection, setCollection],
                ["Numéro", number, setNumber],
                ["Degré", grade, setGrade],
                ["Source de la classification", gradingSource, setGradingSource],
              ] as const).map(([label, value, setter]) => (
                <label key={label} className="grid gap-1 text-[13px] font-semibold">
                  {label}
                  <input
                    value={value}
                    onChange={(event) => setter(event.target.value)}
                    placeholder={todo}
                    className="n-input font-normal"
                  />
                </label>
              ))}
            </div>
          )}
          <div className="text-right">
            <button type="submit" disabled={pending === "new"} className="n-btn n-btn-sage disabled:opacity-40">
              {pending === "new" ? "Enregistrement…" : "Enregistrer la fiche"}
            </button>
          </div>
        </form>
      </details>

      <div>
        <h2 className="n-display px-1 text-[22px]">Mes fiches</h2>
        {items === undefined ? (
          <p className="mt-3 px-1 text-[15px] text-(--n-muted)">Chargement des fiches…</p>
        ) : items.length === 0 ? (
          <p className="n-dashed mt-3 text-center">
            Aucune fiche pour le moment. Crée une fiche, puis complète-la avec un contenu
            vérifié.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {items.map((item) => (
              <li key={item._id} className="n-card n-rise">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="n-label">
                      {item.kind === "matn" ? "Matn" : "Hadith · source à relire"}
                    </span>
                    <h3 className="n-display mt-2 text-[18px]">{item.title}</h3>
                  </div>
                  <button
                    type="button"
                    className="n-link text-[13px] text-(--n-muted)! disabled:opacity-50"
                    disabled={pending === item._id}
                    onClick={() => void deleteItem(item._id)}
                  >
                    Supprimer
                  </button>
                </div>
                {item.kind === "matn" ? (
                  <>
                    {item.portions.length ? (
                      <ol className="mt-3 list-inside list-decimal space-y-1 text-[15px]">
                        {item.portions.map((part, index) => (
                          <li key={`${index}-${part}`}>{part}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="mt-3 text-[15px] text-(--n-muted)">{todo}</p>
                    )}
                    <div className="mt-4 flex flex-wrap items-end gap-3">
                      <label className="grid gap-1 text-[13px] font-semibold">
                        Statut
                        <select
                          value={item.status}
                          disabled={pending === item._id}
                          onChange={(event) =>
                            void changeStatus(item._id, event.target.value as LearningStatus)
                          }
                          className="n-select"
                        >
                          {Object.entries(statusLabel).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-1 text-[13px] font-semibold">
                        À revoir le
                        <input
                          type="date"
                          value={item.reviewDate ?? ""}
                          disabled={pending === item._id}
                          onChange={(event) => void changeReviewDate(item._id, event.target.value)}
                          className="n-input h-10!"
                        />
                      </label>
                    </div>
                    <p className="mt-2 text-[13px] text-(--n-muted)">
                      Un rappel de révision doux, sans série ni objectif quotidien.
                    </p>
                  </>
                ) : (
                  <dl className="mt-3 grid gap-x-4 gap-y-3 text-[14px] sm:grid-cols-2">
                    {([
                      ["Texte arabe", item.arabic],
                      ["Translittération", item.transliteration],
                      ["Traduction française", item.translation],
                      ["Rapporteur", item.narrator],
                      ["Recueil", item.collection],
                      ["Numéro", item.number],
                      ["Degré", item.grade],
                      ["Source de classification", item.gradingSource],
                    ] as const).map(([label, value]) => (
                      <div key={label}>
                        <dt className="font-semibold">{label}</dt>
                        <dd className="mt-0.5 whitespace-pre-wrap text-(--n-muted)">{value || todo}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
