import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  QuranAudioReader,
  type QuranPlaybackProgress,
} from "@/components/dashboard/QuranAudioReader";
import type { QuranResumePosition } from "@/components/dashboard/quranPlaybackResume";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

function todayKey() {
  return new Intl.DateTimeFormat("fr-CA").format(new Date());
}

export function QuranJournal({
  resumePosition = null,
}: {
  resumePosition?: QuranResumePosition | null;
}) {
  const entries = useQuery(api.quranProgress.list, {});
  const addEntry = useMutation(api.quranProgress.add);
  const removeEntry = useMutation(api.quranProgress.remove);
  const [date, setDate] = useState(todayKey);
  const [time, setTime] = useState("07:00");
  const [passage, setPassage] = useState("");
  const [pagesOrVerses, setPagesOrVerses] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAudioProgress, setIsSavingAudioProgress] = useState(false);
  const [pendingDelete, setPendingDelete] =
    useState<Id<"quranReadingLogs"> | null>(null);

  const saveEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await addEntry({
        date,
        time,
        passage,
        pagesOrVerses: pagesOrVerses || undefined,
        notes: notes || undefined,
      });
      setPassage("");
      setPagesOrVerses("");
      setNotes("");
      toast.success("Lecture ajoutée au journal.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer cette lecture.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const saveAudioProgress = async (
    progress: QuranPlaybackProgress,
  ): Promise<boolean> => {
    setIsSavingAudioProgress(true);
    try {
      await addEntry({
        date: todayKey(),
        time: new Intl.DateTimeFormat("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }).format(new Date()),
        passage: `${progress.surah} · récitation suivie`,
        pagesOrVerses: `Versets ${progress.startAyah} à ${progress.lastCompletedAyah}`,
        notes: `Récitateur : ${progress.reciter}`,
      });
      toast.success("Ta progression d’écoute a été ajoutée au journal.");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer cette progression.",
      );
      return false;
    } finally {
      setIsSavingAudioProgress(false);
    }
  };

  const deleteEntry = async (logId: Id<"quranReadingLogs">) => {
    if (!window.confirm("Supprimer cette entrée du journal de lecture ?"))
      return;
    setPendingDelete(logId);
    try {
      await removeEntry({ logId });
      toast.success("Entrée supprimée.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer cette entrée.",
      );
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <section
      id="dashboard-quran"
      className="scroll-mt-24 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6"
    >
      <div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Suivi de lecture
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight">
            Journal Al-Qur’an
          </h1>
        </div>
      </div>
      <p className="mt-3 text-base leading-6 text-stone-600">
        Note les passages lus et reprends ta lecture là où tu l’as laissée.
      </p>

      <QuranAudioReader
        isSavingProgress={isSavingAudioProgress}
        onSaveProgress={saveAudioProgress}
        resumePosition={resumePosition}
      />

      <form
        onSubmit={(event) => void saveEntry(event)}
        className="mt-5 space-y-4 rounded-2xl bg-[#F5F2EE] p-4"
      >
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px_120px]">
          <label className="text-base font-medium text-stone-700">
            Sourate ou passage lu
            <Input
              value={passage}
              onChange={(event) => setPassage(event.target.value)}
              maxLength={120}
              placeholder="Ex. Sourate Al-Baqara"
              required
              className="mt-1.5 border-stone-200 bg-white text-base md:text-base"
            />
          </label>
          <label className="text-base font-medium text-stone-700">
            Date de lecture
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
          Pages ou versets{" "}
          <span className="text-[15px] font-normal text-stone-500">
            (facultatif)
          </span>
          <Input
            value={pagesOrVerses}
            onChange={(event) => setPagesOrVerses(event.target.value)}
            maxLength={120}
            placeholder="Ex. pages 10–15 ou versets 1–20"
            className="mt-1.5 border-stone-200 bg-white text-base md:text-base"
          />
        </label>
        <label className="block text-base font-medium text-stone-700">
          Notes personnelles{" "}
          <span className="text-[15px] font-normal text-stone-500">
            (facultatif)
          </span>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={2000}
            placeholder="Réflexions ou points à revoir…"
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
            className="bg-emerald-900 text-[15px] text-white hover:bg-emerald-800"
          >
            {isSaving ? "Enregistrement…" : "Ajouter la lecture"}
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <h2 className="text-base font-semibold text-stone-800">
          Lectures récentes
        </h2>
        {entries === undefined ? (
          <p className="mt-3 text-base text-stone-500">
            Chargement du journal…
          </p>
        ) : entries.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-stone-200 p-4 text-base text-stone-500">
            <span className="text-base">
              Tes lectures apparaîtront ici après leur ajout.
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
                      {entry.time ?? "07:00"}
                    </time>
                    <h3 className="mt-1 text-base font-semibold text-stone-900">
                      {entry.passage}
                    </h3>
                    {entry.pagesOrVerses && (
                      <p className="mt-1 text-[15px] text-stone-600">
                        {entry.pagesOrVerses}
                      </p>
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
                    aria-label={`Supprimer la lecture ${entry.passage}`}
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
