import { ComposerCard } from "@/components/dashboard/ComposerCard";
import { api } from "@/convex/_generated/api";
import { NotebookPen } from "lucide-react";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { DateField } from "@/components/dashboard/DateField";
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
  const updateItem = useMutation(api.scienceLearning.update);
  // Fiche en cours de correction (une seule à la fois) et ses champs.
  const [editingId, setEditingId] = useState<Id<"scienceLearningItems"> | null>(null);
  const [edit, setEdit] = useState({
    title: "",
    arabic: "",
    portions: "",
    transliteration: "",
    translation: "",
    narrator: "",
    collection: "",
    number: "",
    grade: "",
    gradingSource: "",
  });
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
        // Matn : texte arabe, une portion par ligne. Hadith : texte arabe du hadith.
        arabic: arabic.trim() || undefined,
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

  const startEdit = (item: Doc<"scienceLearningItems">) => {
    setEditingId(item._id);
    setEdit({
      title: item.title,
      arabic: item.arabic ?? "",
      portions: item.portions.join("\n"),
      transliteration: item.transliteration ?? "",
      translation: item.translation ?? "",
      narrator: item.narrator ?? "",
      collection: item.collection ?? "",
      number: item.number ?? "",
      grade: item.grade ?? "",
      gradingSource: item.gradingSource ?? "",
    });
  };

  const saveEdit = async (item: Doc<"scienceLearningItems">) => {
    setPending(item._id);
    try {
      await updateItem({
        itemId: item._id,
        title: edit.title,
        portions: item.kind === "matn" ? edit.portions.split("\n") : [],
        arabic: edit.arabic || undefined,
        transliteration: edit.transliteration || undefined,
        translation: edit.translation || undefined,
        narrator: edit.narrator || undefined,
        collection: edit.collection || undefined,
        number: edit.number || undefined,
        grade: edit.grade || undefined,
        gradingSource: edit.gradingSource || undefined,
      });
      setEditingId(null);
      toast.success("Fiche corrigée.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible de modifier la fiche.");
    } finally {
      setPending(null);
    }
  };

  // Résumé (carte de droite) : fiches par statut et prochaine révision prévue.
  const today = new Intl.DateTimeFormat("fr-CA").format(new Date());
  const countBy = (status: LearningStatus) => (items ?? []).filter((item) => item.status === status).length;
  const nextReview = (items ?? [])
    .filter((item) => item.reviewDate && item.reviewDate >= today && item.status !== "memorized")
    .sort((first, second) => (first.reviewDate ?? "").localeCompare(second.reviewDate ?? ""))[0];

  return (
    <div className="space-y-5">
      <div className="grid items-start gap-4 lg:grid-cols-3">
      <ComposerCard title="Nouvelle fiche" hint="Un matn à apprendre par portions (en arabe, avec ta traduction si tu veux), ou un hadith à documenter. Rawdah ne fournit aucun contenu ici : complète chaque fiche avec un contenu vérifié." icon={NotebookPen} defaultOpen={items !== undefined && items.length === 0} className="lg:col-span-2">
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
              <label className="grid gap-1 text-[13px] font-semibold sm:col-span-2">
                Texte arabe du matn (une portion par ligne)
                <textarea
                  value={arabic}
                  onChange={(event) => setArabic(event.target.value)}
                  maxLength={20000}
                  dir="rtl"
                  lang="ar"
                  className="n-input n-textarea n-arabic text-[20px]! font-normal"
                />
              </label>
              <label className="grid gap-1 text-[13px] font-semibold">
                Traduction ou explication (une portion par ligne, facultatif)
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
                <DateField value={reviewDate} onChange={setReviewDate} clearable />
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
      </ComposerCard>

        <article className="n-card n-card-dark">
          <span className="n-label">Ton apprentissage</span>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {(
              [
                [countBy("to-learn"), "à apprendre"],
                [countBy("learning"), "en cours"],
                [countBy("memorized"), "mémorisés"],
              ] as const
            ).map(([count, label]) => (
              <div key={label}>
                <p className="n-display text-[36px] leading-none">{count}</p>
                <p className="mt-1 text-[13px] text-(--n-on-dark-muted)">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 border-t border-white/15 pt-4 text-[14px] text-(--n-on-dark-muted)">
            {nextReview?.reviewDate ? (
              <>
                Prochaine révision :{" "}
                <b className="font-semibold text-(--n-on-dark)">{nextReview.title}</b>
                {", le "}
                {new Date(`${nextReview.reviewDate}T12:00:00`).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                })}
              </>
            ) : (
              "Tes prochaines révisions apparaîtront ici."
            )}
          </p>
        </article>
      </div>

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
            {items.map((item) =>
              editingId === item._id ? (
                <li key={item._id} className="n-card">
                  <form
                    className="space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void saveEdit(item);
                    }}
                  >
                    <span className="n-label">
                      {item.kind === "matn" ? "Corriger le matn" : "Corriger la fiche hadith"}
                    </span>
                    <label className="grid gap-1 text-[13px] font-semibold">
                      Titre
                      <input
                        value={edit.title}
                        onChange={(event) => setEdit({ ...edit, title: event.target.value })}
                        maxLength={200}
                        required
                        className="n-input font-normal"
                      />
                    </label>
                    {item.kind === "matn" ? (
                      <>
                        <label className="grid gap-1 text-[13px] font-semibold">
                          Texte arabe du matn (une portion par ligne)
                          <textarea
                            value={edit.arabic}
                            onChange={(event) => setEdit({ ...edit, arabic: event.target.value })}
                            maxLength={20000}
                            dir="rtl"
                            lang="ar"
                            className="n-input n-textarea n-arabic text-[20px]! font-normal"
                          />
                        </label>
                        <label className="grid gap-1 text-[13px] font-semibold">
                          Traduction ou explication (une portion par ligne)
                          <textarea
                            value={edit.portions}
                            onChange={(event) => setEdit({ ...edit, portions: event.target.value })}
                            maxLength={10000}
                            className="n-input n-textarea font-normal"
                          />
                        </label>
                      </>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {(
                          [
                            ["arabic", "Texte arabe"],
                            ["transliteration", "Translittération"],
                            ["translation", "Traduction française"],
                            ["narrator", "Rapporteur"],
                            ["collection", "Recueil"],
                            ["number", "Numéro"],
                            ["grade", "Degré"],
                            ["gradingSource", "Source de la classification"],
                          ] as const
                        ).map(([field, label]) => (
                          <label key={field} className="grid gap-1 text-[13px] font-semibold">
                            {label}
                            <input
                              value={edit[field]}
                              onChange={(event) => setEdit({ ...edit, [field]: event.target.value })}
                              dir={field === "arabic" ? "rtl" : undefined}
                              className="n-input font-normal"
                            />
                          </label>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        className="n-link text-sm text-(--n-muted)!"
                        onClick={() => setEditingId(null)}
                      >
                        Annuler
                      </button>
                      <button type="submit" disabled={pending === item._id} className="n-btn n-btn-sage disabled:opacity-40">
                        {pending === item._id ? "Enregistrement…" : "Enregistrer"}
                      </button>
                    </div>
                  </form>
                </li>
              ) : (
              <li key={item._id} className="n-card n-rise">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="n-label">
                      {item.kind === "matn" ? "Matn" : "Hadith · source à relire"}
                    </span>
                    <h3 className="n-display mt-2 text-[18px]">{item.title}</h3>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="n-link text-[13px] disabled:opacity-50"
                      disabled={editingId !== null}
                      onClick={() => startEdit(item)}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="n-link text-[13px] text-(--n-muted)! disabled:opacity-50"
                      disabled={pending === item._id}
                      onClick={() => void deleteItem(item._id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                {item.kind === "matn" ? (
                  <>
                    {item.arabic ? (
                      // Chaque portion arabe, avec sa traduction (même numéro de ligne) juste en dessous.
                      <ol className="mt-3 space-y-3">
                        {item.arabic
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean)
                          .map((line, index) => (
                            <li key={`${index}-${line}`}>
                              <p className="n-arabic text-[22px]" lang="ar">
                                {line}
                              </p>
                              {item.portions[index] && (
                                <p className="text-[15px] text-(--n-muted)" dir="auto">
                                  {item.portions[index]}
                                </p>
                              )}
                            </li>
                          ))}
                      </ol>
                    ) : item.portions.length ? (
                      <ol className="mt-3 list-inside list-decimal space-y-1 text-[15px]">
                        {item.portions.map((part, index) => (
                          <li key={`${index}-${part}`} dir="auto">
                            {part}
                          </li>
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
                        <DateField
                          value={item.reviewDate ?? ""}
                          disabled={pending === item._id}
                          onChange={(date) => void changeReviewDate(item._id, date)}
                          clearable
                          className="h-10!"
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
              ),
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
