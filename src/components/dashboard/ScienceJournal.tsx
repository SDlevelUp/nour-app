import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

function todayKey() {
  return new Intl.DateTimeFormat("fr-CA").format(new Date());
}

export function ScienceJournal() {
  const entries = useQuery(api.scienceProgress.list, {});
  const addEntry = useMutation(api.scienceProgress.add);
  const removeEntry = useMutation(api.scienceProgress.remove);
  const [date, setDate] = useState(todayKey);
  const [time, setTime] = useState("10:00");
  const [title, setTitle] = useState("");
  const [lesson, setLesson] = useState("");
  const [source, setSource] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDelete, setPendingDelete] =
    useState<Id<"scienceStudyLogs"> | null>(null);

  const saveEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await addEntry({
        date,
        time,
        title,
        lesson,
        source: source || undefined,
        url: url || undefined,
        notes: notes || undefined,
      });
      setTitle("");
      setLesson("");
      setSource("");
      setUrl("");
      setNotes("");
      toast.success("Séance ajoutée au suivi.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer cette séance.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = async (logId: Id<"scienceStudyLogs">) => {
    if (!window.confirm("Supprimer cette séance du suivi ?")) return;
    setPendingDelete(logId);
    try {
      await removeEntry({ logId });
      toast.success("Séance supprimée.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer cette séance.",
      );
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <section
      id="dashboard-science"
      className="scroll-mt-24 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6"
    >
      <div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Suivi d’étude
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight">
            Science bénéfique
          </h1>
        </div>
      </div>
      <p className="mt-3 text-base leading-6 text-stone-600">
        Garde une trace des cours et livres étudiés, des leçons suivies et des
        enseignements à retenir.
      </p>

      <form
        onSubmit={(event) => void saveEntry(event)}
        className="mt-5 space-y-4 rounded-2xl bg-[#F5F2EE] p-4"
      >
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
          <label className="text-base font-medium text-stone-700">
            Cours ou livre étudié
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={160}
              placeholder="Ex. Les 40 hadiths de l’imam An-Nawawi"
              required
              className="mt-1.5 border-stone-200 bg-white text-base md:text-base"
            />
          </label>
          <label className="text-base font-medium text-stone-700">
            Date d’étude
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
              className="mt-1.5 border-stone-200 bg-white text-base md:text-base"
            />
          </label>
          <label className="text-base font-medium text-stone-700">
            Heure à afficher dans le planning
            <Input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
              className="mt-1.5 border-stone-200 bg-white text-base md:text-base"
            />
          </label>
        </div>
        <label className="block text-base font-medium text-stone-700">
          Leçon ou chapitre suivi
          <Input
            value={lesson}
            onChange={(event) => setLesson(event.target.value)}
            maxLength={200}
            placeholder="Ex. Hadith 3 — Les piliers de l’islam"
            required
            className="mt-1.5 border-stone-200 bg-white text-base md:text-base"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-base font-medium text-stone-700">
            Enseignant ou source{" "}
            <span className="text-[15px] font-normal text-stone-500">
              (facultatif)
            </span>
            <Input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              maxLength={160}
              placeholder="Nom de l’enseignant ou de la chaîne"
              className="mt-1.5 border-stone-200 bg-white text-base md:text-base"
            />
          </label>
          <label className="text-base font-medium text-stone-700">
            Lien du cours{" "}
            <span className="text-[15px] font-normal text-stone-500">
              (facultatif, HTTPS)
            </span>
            <Input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://…"
              className="mt-1.5 border-stone-200 bg-white text-base md:text-base"
            />
          </label>
        </div>
        <label className="block text-base font-medium text-stone-700">
          Notes à retenir{" "}
          <span className="text-[15px] font-normal text-stone-500">
            (facultatif)
          </span>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={2000}
            placeholder="Résumé, idées importantes ou questions…"
            className="mt-1.5 min-h-20 border-stone-200 bg-white text-base md:text-base"
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[15px] text-stone-500">
            {notes.length}/2 000
          </span>
          <Button
            type="submit"
            disabled={isSaving}
            className="gap-2 bg-emerald-900 text-[15px] text-white hover:bg-emerald-800"
          >
            Ajouter la séance
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <h2 className="text-base font-semibold text-stone-800">
          Études récentes
        </h2>
        {entries === undefined ? (
          <p className="mt-3 text-base text-stone-500">Chargement du suivi…</p>
        ) : entries.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-stone-200 p-4 text-base text-stone-500">
            <span className="text-base">
              Tes cours et lectures apparaîtront ici après leur ajout.
            </span>
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {entries.map((entry) => (
              <li
                key={entry._id}
                className="rounded-2xl border border-stone-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <time
                      dateTime={entry.date}
                      className="text-[15px] font-medium text-emerald-800"
                    >
                      {new Date(`${entry.date}T12:00:00`).toLocaleDateString(
                        "fr-FR",
                        {
                          dateStyle: "long",
                        },
                      )}
                      {" · "}
                      {entry.time ?? "10:00"}
                    </time>
                    <h3 className="mt-1 text-base font-semibold text-stone-900">
                      {entry.title}
                    </h3>
                    <p className="study-prose mt-1 text-[15px] text-stone-700">
                      {entry.lesson}
                    </p>
                    {entry.source && (
                      <p className="mt-1 text-[15px] text-stone-500">
                        {entry.source}
                      </p>
                    )}
                    {entry.url && (
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[15px] font-medium text-emerald-800 underline underline-offset-2"
                      >
                        Ouvrir le cours
                      </a>
                    )}
                    {entry.notes && (
                      <p className="study-prose mt-2 whitespace-pre-wrap text-base text-stone-600">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteEntry(entry._id)}
                    disabled={pendingDelete === entry._id}
                    aria-label={`Supprimer la séance ${entry.title}`}
                    className="shrink-0 rounded-lg px-2 py-1 text-sm text-stone-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                  >
                    {pendingDelete === entry._id ? "Suppression…" : "Supprimer"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
