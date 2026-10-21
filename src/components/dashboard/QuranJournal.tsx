import {
  QuranAudioReader,
  type QuranPlaybackProgress,
} from "@/components/dashboard/QuranAudioReader";
import type { QuranResumePosition } from "@/components/dashboard/quranPlaybackResume";
import { ComposerCard } from "@/components/dashboard/ComposerCard";
import { api } from "@/convex/_generated/api";
import { PenLine } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

function todayKey() {
  return new Intl.DateTimeFormat("fr-CA").format(new Date());
}

export function QuranJournal({
  resumePosition = null,
  isActive = true,
  onOpen,
}: {
  resumePosition?: QuranResumePosition | null;
  isActive?: boolean;
  onOpen?: () => void;
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
    <section id="dashboard-quran" className="scroll-mt-24 space-y-4">
      <div className="n-page-head px-1" hidden={!isActive}>
        <div>
          <span className="n-label">Lecture et écoute</span>
          <h1 className="n-page-title">Coran</h1>
        </div>
      </div>

      <QuranAudioReader
        isSavingProgress={isSavingAudioProgress}
        onSaveProgress={saveAudioProgress}
        resumePosition={resumePosition}
        isActive={isActive}
        onOpen={onOpen}
      />

      <ComposerCard title="Noter une lecture" hint="Pour garder la trace d’un passage lu en dehors du lecteur." icon={PenLine} hidden={!isActive}>
      <form
        onSubmit={(event) => void saveEntry(event)}
        className="mt-5 space-y-4"
      >
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px_120px]">
          <label className="grid gap-1 text-[13px] font-semibold">
            Sourate ou passage lu
            <input
              value={passage}
              onChange={(event) => setPassage(event.target.value)}
              maxLength={120}
              placeholder="Ex. Sourate Al-Baqara"
              required
              className="n-input"
            />
          </label>
          <label className="grid gap-1 text-[13px] font-semibold">
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
              className="n-input"
            />
          </label>
          <label className="grid gap-1 text-[13px] font-semibold">
            Heure
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
              className="n-input"
            />
          </label>
        </div>
        <label className="grid gap-1 text-[13px] font-semibold">
          Pages ou versets (facultatif)
          <input
            value={pagesOrVerses}
            onChange={(event) => setPagesOrVerses(event.target.value)}
            maxLength={120}
            placeholder="Ex. pages 10–15 ou versets 1–20"
            className="n-input"
          />
        </label>
        <label className="grid gap-1 text-[13px] font-semibold">
          Notes personnelles (facultatif)
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={2000}
            placeholder="Réflexions ou points à revoir…"
            className="n-input n-textarea font-normal"
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] tabular-nums text-(--n-muted)">{notes.length}/2 000</span>
          <button type="submit" disabled={isSaving} className="n-btn n-btn-sage disabled:opacity-40">
            {isSaving ? "Enregistrement…" : "Ajouter la lecture"}
          </button>
        </div>
      </form>
      </ComposerCard>

      <div className="n-card" hidden={!isActive}>
        <h2 className="n-display text-xl">Lectures récentes</h2>
        {entries === undefined ? (
          <p className="mt-3 text-[15px] text-(--n-muted)">Chargement du journal…</p>
        ) : entries.length === 0 ? (
          <p className="mt-3 text-[15px] text-(--n-muted)">
            Tes lectures apparaîtront ici après leur ajout.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-(--n-line)">
            {entries.map((entry) => (
              <li key={entry._id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <time dateTime={entry.date} className="text-[13px] font-semibold text-(--n-sage)">
                    {new Date(`${entry.date}T12:00:00`).toLocaleDateString("fr-FR", {
                      dateStyle: "long",
                    })}
                    {" · "}
                    {entry.time ?? "07:00"}
                  </time>
                  <h3 className="mt-1 text-[16px] font-semibold">{entry.passage}</h3>
                  {entry.pagesOrVerses && (
                    <p className="mt-0.5 text-[14px] text-(--n-muted)">{entry.pagesOrVerses}</p>
                  )}
                  {entry.notes && (
                    <p className="mt-2 whitespace-pre-wrap text-[15px] leading-6 text-(--n-muted)">
                      {entry.notes}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void deleteEntry(entry._id)}
                  disabled={pendingDelete === entry._id}
                  aria-label={`Supprimer la lecture ${entry.passage}`}
                  className="n-link shrink-0 text-[13px] text-(--n-muted)! disabled:opacity-50"
                >
                  {pendingDelete === entry._id ? "Suppression…" : "Supprimer"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
