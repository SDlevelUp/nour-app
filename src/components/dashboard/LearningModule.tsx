import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const todo = "TODO — à compléter après validation";

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
    <section className="mt-5 rounded-2xl border border-[#DCE5DC] p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-stone-900">Apprentissage et hadiths</h2>
      <p className="mt-1 text-sm leading-5 text-stone-600">
        Prépare tes fiches et tes portions de révision. Aucun contenu religieux
        n’est fourni ici : les champs manquants restent TODO pour relecture.
      </p>
      <form onSubmit={(event) => void save(event)} className="mt-4 space-y-3 rounded-2xl bg-[#F5F7F3] p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-stone-700">
            Type de fiche
            <select value={kind} onChange={(event) => setKind(event.target.value as LearningKind)} className="mt-1.5 h-11 w-full rounded-xl border border-stone-200 bg-white px-3">
              <option value="matn">Matn à apprendre</option>
              <option value="hadith">Hadith à documenter</option>
            </select>
          </label>
          <label className="text-sm font-medium text-stone-700">
            {kind === "matn" ? "Titre du matn" : "Titre / repère de la fiche"}
            <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required placeholder="À renseigner après validation" className="mt-1.5 bg-white" />
          </label>
        </div>

        {kind === "matn" ? (
          <>
            <label className="block text-sm font-medium text-stone-700">
              Portions (une par ligne)
              <Textarea value={portions} onChange={(event) => setPortions(event.target.value)} placeholder={todo} maxLength={10000} className="mt-1.5 min-h-24 bg-white" />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Rappel de révision (facultatif)
              <Input type="date" value={reviewDate} onChange={(event) => setReviewDate(event.target.value)} className="mt-1.5 bg-white" />
            </label>
          </>
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
              <label key={label} className="text-sm font-medium text-stone-700">
                {label}
                <Input value={value} onChange={(event) => setter(event.target.value)} placeholder={todo} className="mt-1.5 bg-white" />
              </label>
            ))}
          </div>
        )}
        <Button type="submit" disabled={pending === "new"} className="bg-[#5D7C65] text-white hover:bg-[#45624D]">
          {pending === "new" ? "Enregistrement…" : "Enregistrer la fiche"}
        </Button>
      </form>

      {items === undefined ? (
        <p className="mt-4 text-sm text-stone-500">Chargement des fiches…</p>
      ) : items.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-stone-200 p-4 text-sm text-stone-500">
          Aucune fiche pour le moment. Ajoute une fiche vide, puis complète-la
          seulement avec un contenu validé.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item._id} className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    {item.kind === "matn" ? "Apprentissage · matn" : "Hadith · source à relire"}
                  </p>
                  <h3 className="mt-1 font-semibold text-stone-900">{item.title}</h3>
                </div>
                <Button type="button" variant="outline" disabled={pending === item._id} onClick={() => void deleteItem(item._id)}>Supprimer</Button>
              </div>
              {item.kind === "matn" ? (
                <>
                  <p className="mt-3 text-sm font-medium text-stone-700">Portions</p>
                  {item.portions.length ? (
                    <ol className="mt-1 list-inside list-decimal space-y-1 text-sm text-stone-600">
                      {item.portions.map((part, index) => <li key={`${index}-${part}`}>{part}</li>)}
                    </ol>
                  ) : <p className="mt-1 text-sm text-stone-500">{todo}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <label className="text-sm text-stone-600">Statut
                      <select value={item.status} disabled={pending === item._id} onChange={(event) => void changeStatus(item._id, event.target.value as LearningStatus)} className="ml-2 h-10 rounded-xl border border-stone-200 bg-white px-3">
                        {Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    <label className="text-sm text-stone-600">À revoir
                      <Input type="date" value={item.reviewDate ?? ""} disabled={pending === item._id} onChange={(event) => void changeReviewDate(item._id, event.target.value)} className="ml-2 inline-flex w-auto bg-white" />
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-stone-500">Un rappel de révision doux, sans série ni objectif quotidien.</p>
                </>
              ) : (
                <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                  {([
                    ["Texte arabe", item.arabic], ["Translittération", item.transliteration],
                    ["Traduction française", item.translation], ["Rapporteur", item.narrator],
                    ["Recueil", item.collection], ["Numéro", item.number],
                    ["Degré", item.grade], ["Source de classification", item.gradingSource],
                  ] as const).map(([label, value]) => (
                    <div key={label}><dt className="font-medium text-stone-700">{label}</dt><dd className="mt-0.5 whitespace-pre-wrap text-stone-500">{value || todo}</dd></div>
                  ))}
                </dl>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
