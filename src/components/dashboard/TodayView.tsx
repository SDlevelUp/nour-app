import { addDays, format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import type { AdhkarInvocation, AdhkarSession } from "@/convex/adhkarData";
import type { PrayerTimes } from "@/hooks/use-prayer-times";
import { rappelDuJour } from "@/data/rappels";

type TodayModule = "rappel" | "adhkar" | "quran" | "cycle" | "notes" | "tasks";

const moduleLabels: Record<TodayModule, string> = {
  rappel: "Rappel du jour",
  adhkar: "Adhkar du moment",
  quran: "Reprendre la lecture",
  cycle: "Cycle",
  notes: "Mes notes",
  tasks: "Tâches du jour",
};

const defaultModules: Record<TodayModule, boolean> = {
  rappel: true,
  adhkar: true,
  quran: true,
  cycle: true,
  notes: true,
  tasks: false,
};

// Réglage enregistré dans le navigateur (décision du 2026-10-19).
const modulesStorageKey = "nour-today-modules";

function readModules(): Record<TodayModule, boolean> {
  try {
    const stored = localStorage.getItem(modulesStorageKey);
    if (!stored) return defaultModules;
    const value = JSON.parse(stored) as Partial<Record<TodayModule, unknown>>;
    return {
      rappel: typeof value.rappel === "boolean" ? value.rappel : defaultModules.rappel,
      adhkar: typeof value.adhkar === "boolean" ? value.adhkar : defaultModules.adhkar,
      quran: typeof value.quran === "boolean" ? value.quran : defaultModules.quran,
      cycle: typeof value.cycle === "boolean" ? value.cycle : defaultModules.cycle,
      notes: typeof value.notes === "boolean" ? value.notes : defaultModules.notes,
      tasks: typeof value.tasks === "boolean" ? value.tasks : defaultModules.tasks,
    };
  } catch {
    return defaultModules;
  }
}

const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
// Position horizontale des 5 étapes sur la frise (en %), alignée sur la grille.
const stopPositions = [0, 30, 50, 70, 100];

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return `${hours} h ${String(rest).padStart(2, "0")}`;
}

function timelineProgress(times: number[], now: number) {
  if (now <= times[0]) return 0;
  for (let index = 0; index < times.length - 1; index += 1) {
    if (now < times[index + 1]) {
      const ratio = (now - times[index]) / (times[index + 1] - times[index]);
      return (
        stopPositions[index] +
        ratio * (stopPositions[index + 1] - stopPositions[index])
      );
    }
  }
  return 100;
}

function KhatamPattern() {
  return (
    <svg className="n-pattern" aria-hidden="true">
      <defs>
        <pattern id="nour-khatam" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect x="8" y="8" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <rect
            x="8"
            y="8"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            transform="rotate(45 20 20)"
          />
          <circle cx="0" cy="0" r="2.5" fill="none" stroke="currentColor" />
          <circle cx="40" cy="40" r="2.5" fill="none" stroke="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#nour-khatam)" />
    </svg>
  );
}

type TodayViewProps = {
  firstName?: string;
  now: number;
  prayer: {
    times: PrayerTimes | null;
    isLoading: boolean;
    error: string | null;
  };
  adhkar: {
    session: AdhkarSession;
    invocation?: AdhkarInvocation;
    index: number;
    total: number;
    repetitionCount: number;
    isLoading: boolean;
  };
  quran: {
    surah?: string;
    detail?: string;
  };
  cycle: {
    currentPeriodDay: number | null;
    expectedNextPeriod: Date | null;
    periodDates: Set<string>;
  };
  tasks: { id: string; label: string; completed: boolean }[];
  notes: { id: string; title?: string; content: string; cardClass: string; urgent: boolean }[];
  pendingTaskId: string | null;
  onToggleTask: (id: string, completed: boolean) => void;
  onOpenAdhkar: (session: AdhkarSession) => void;
  onOpenQuran: () => void;
  onOpenCycle: () => void;
  onOpenNotes: () => void;
  onOpenSettings: () => void;
};

export function TodayView({
  firstName,
  now,
  prayer,
  adhkar,
  quran,
  cycle,
  tasks,
  notes,
  pendingTaskId,
  onToggleTask,
  onOpenAdhkar,
  onOpenQuran,
  onOpenCycle,
  onOpenNotes,
  onOpenSettings,
}: TodayViewProps) {
  const [modules, setModules] = useState(readModules);
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(modulesStorageKey, JSON.stringify(modules));
    } catch {
      // Stockage indisponible (navigation privée) : le réglage reste en mémoire.
    }
  }, [modules]);

  const date = new Date(now);
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const prayerTimes = prayer.times
    ? prayerNames.map((name) => ({
        name,
        time: prayer.times![name.toLowerCase() as keyof PrayerTimes],
      }))
    : null;
  const prayerMinutes = prayerTimes?.map(({ time }) => toMinutes(time)) ?? [];
  const nextIndex = prayerMinutes.findIndex((minutes) => minutes > nowMinutes);
  const nextPrayer =
    prayerTimes && nextIndex >= 0 ? prayerTimes[nextIndex] : null;
  const minutesLeft =
    nextIndex >= 0
      ? prayerMinutes[nextIndex] - nowMinutes
      : prayerMinutes.length
        ? 24 * 60 - nowMinutes + prayerMinutes[0]
        : 0;
  const progress = prayerMinutes.length
    ? timelineProgress(prayerMinutes, nowMinutes)
    : 0;

  const gregorianRaw = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  const gregorian = gregorianRaw.charAt(0).toUpperCase() + gregorianRaw.slice(1);
  const hijri = new Intl.DateTimeFormat("fr-FR-u-ca-islamic", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  const rappel = rappelDuJour(date);
  const showsRappel = modules.rappel && rappel !== null;

  const week = [-2, -1, 0, 1, 2, 3, 4].map((offset) => {
    const day = offset < 0 ? subDays(date, -offset) : addDays(date, offset);
    const key = format(day, "yyyy-MM-dd");
    return {
      key,
      weekday: format(day, "EEE", { locale: fr }).replace(".", ""),
      day: format(day, "d"),
      isToday: offset === 0,
      isPeriod: cycle.periodDates.has(key),
    };
  });

  return (
    <div id="dashboard-home" className="scroll-mt-24 pb-6">
      <header className="n-rise">
        <p className="n-greeting-ar" lang="ar" dir="rtl">
          السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ
        </p>
        <h1 className="n-display mt-1 text-[clamp(20px,2.1vw,28px)] leading-[1.2] text-(--n-ink) xl:whitespace-nowrap">
          As-salâmu ʿalaykum wa raḥmatullâhi wa barakâtuh
          {firstName && <span className="text-(--n-sage)">, {firstName}</span>}
        </h1>
        <p className="mt-3 text-[15px] text-(--n-muted)">
          <span className="font-semibold text-(--n-ink)">{gregorian}</span>
          {" · "}
          {hijri}
          <span className="text-[13px]"> (date hégirienne indicative)</span>
        </p>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-6">
        {/* Prochaine prière : toujours affichée */}
        <article className={`n-card n-card-dark n-rise ${showsRappel ? "lg:col-span-4" : "lg:col-span-6"}`} aria-label="Prochaine prière">
          <KhatamPattern />
          {prayerTimes ? (
            <>
              <div className="relative flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="n-label">
                    {nextPrayer ? "Prochaine prière" : "Prochaine prière, demain"}
                  </span>
                  <p className="n-display mt-3 text-[28px] leading-none">
                    {nextPrayer?.name ?? "Fajr"}
                  </p>
                </div>
                <p className="text-[17px] text-(--n-on-dark-muted)">
                  dans <b className="font-semibold text-white">{formatDuration(minutesLeft)}</b>
                </p>
              </div>
              <p className="n-display relative text-[clamp(60px,10vw,100px)] font-medium leading-[0.95] tabular-nums tracking-[-0.03em]">
                {nextPrayer?.time ?? prayerTimes[0].time}
              </p>
              <div className="n-timeline">
                <div className="n-track">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <ol className="n-stops">
                  {prayerTimes.map(({ name, time }, index) => (
                    <li
                      key={name}
                      className="n-stop"
                      data-state={
                        index === nextIndex
                          ? "next"
                          : nextIndex === -1 || index < nextIndex
                            ? "done"
                            : "upcoming"
                      }
                    >
                      <i className="n-stop-dot" />
                      {name}
                      <span className="n-stop-time">{time}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          ) : (
            <div className="relative">
              <span className="n-label">Horaires de prière</span>
              <p className="n-display mt-3 text-2xl">
                {prayer.isLoading ? "Calcul des horaires…" : "Ta position est nécessaire"}
              </p>
              <p className="mt-2 max-w-md text-[15px] text-(--n-on-dark-muted)">
                {prayer.error ??
                  "Autorise l’accès à ta position pour calculer les horaires de prière de ta ville."}
              </p>
              {!prayer.isLoading && (
                <button type="button" onClick={onOpenSettings} className="n-btn mt-5 bg-(--n-on-dark)! text-(--n-sage-dark)!">
                  Configurer ma position
                </button>
              )}
            </div>
          )}
        </article>

        {modules.rappel && rappel && (
          <figure className="n-card n-rappel n-rise flex flex-col lg:col-span-2">
            <span className="n-label">Rappel du jour</span>
            {rappel.arabic && (
              <p className="n-arabic mt-4 text-[22px] leading-[1.9]" lang="ar">
                {rappel.arabic}
              </p>
            )}
            <blockquote className="n-rappel-text">{rappel.text}</blockquote>
            <figcaption className="mt-auto pt-4 text-[13px] text-(--n-muted)">
              <span className="font-semibold text-(--n-ink)">{rappel.author}</span>
              {" · "}
              {/^https?:\/\//.test(rappel.source) ? (
                <a href={rappel.source} target="_blank" rel="noreferrer" className="n-link font-normal">
                  Source
                </a>
              ) : (
                rappel.source
              )}
            </figcaption>
          </figure>
        )}

        {modules.adhkar && (
          <article
            className={`n-card n-rise flex flex-col gap-4 ${modules.quran ? "lg:col-span-4" : "lg:col-span-6"}`}
            aria-label="Adhkar du moment"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="n-label">
                Adhkar du {adhkar.session === "morning" ? "matin" : "soir"}
              </span>
              {adhkar.invocation && (
                <span className="n-chip">
                  {adhkar.index + 1} sur {adhkar.total}
                </span>
              )}
            </div>
            {adhkar.isLoading ? (
              <p className="text-[15px] text-(--n-muted)">Chargement…</p>
            ) : adhkar.invocation ? (
              <>
                <p className="n-arabic text-[clamp(22px,3vw,30px)]" lang="ar">
                  {adhkar.invocation.arabic}
                </p>
                <p className="text-[15px] italic text-(--n-muted)">
                  {adhkar.invocation.transliteration}
                </p>
                <p className="text-base">{adhkar.invocation.meaning}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-(--n-muted)">
                    {adhkar.repetitionCount} / {adhkar.invocation.repetitions} récitation
                    {adhkar.invocation.repetitions > 1 ? "s" : ""}
                  </span>
                  <button type="button" onClick={() => onOpenAdhkar(adhkar.session)} className="n-btn">
                    Continuer
                  </button>
                </div>
                <p className="border-t border-(--n-line) pt-3 text-[13px] text-(--n-muted)">
                  {adhkar.invocation.proof.sources.map((source, index) => (
                    <span key={`${source.collection}-${source.number}`}>
                      {index > 0 && " · "}
                      <b className="font-semibold text-(--n-ink)">
                        {source.collection} {source.number}
                      </b>{" "}
                      {source.grades[0]?.grade}
                      {source.grades[0] && ` (${source.grades[0].by})`}
                    </span>
                  ))}
                </p>
              </>
            ) : (
              <>
                <p className="n-display text-2xl">Adhkar terminés pour ce moment.</p>
                <button
                  type="button"
                  onClick={() => onOpenAdhkar(adhkar.session === "morning" ? "evening" : "morning")}
                  className="n-link self-start"
                >
                  Voir les adhkar du {adhkar.session === "morning" ? "soir" : "matin"}
                </button>
              </>
            )}
          </article>
        )}

        {modules.quran && (
          <article
            className={`n-card n-card-tint n-rise flex flex-col gap-3 ${modules.adhkar ? "lg:col-span-2" : "lg:col-span-6"}`}
            aria-label="Lecture du Coran"
          >
            <span className="n-label">Reprendre la lecture</span>
            <p className="n-display text-[26px] leading-tight">
              {quran.surah ?? "Aucune lecture récente"}
            </p>
            {quran.detail && (
              <p className="text-[15px] text-(--n-muted)">{quran.detail}</p>
            )}
            <button type="button" onClick={onOpenQuran} className="n-btn n-btn-sage mt-auto self-start">
              {quran.surah ? "Continuer" : "Ouvrir le Coran"}
            </button>
          </article>
        )}

        {modules.cycle && (
          <article className="n-card n-rise grid gap-4 lg:col-span-6 lg:grid-cols-[1fr_auto] lg:items-center" aria-label="Cycle">
            <div>
              <span className="n-label text-(--n-mauve)!">Cycle</span>
              <h2 className="n-display mt-3 text-[24px] leading-tight">
                {cycle.currentPeriodDay !== null
                  ? `Jour ${cycle.currentPeriodDay} · prière et jeûne en pause`
                  : cycle.expectedNextPeriod
                    ? `Prochaines règles estimées vers le ${format(cycle.expectedNextPeriod, "d MMMM", { locale: fr })}`
                    : "Suivi du cycle"}
              </h2>
              <p className="mt-1 text-[15px] text-(--n-muted)">
                {cycle.currentPeriodDay !== null
                  ? "Les jeûnes manqués se rattrapent, pas les prières."
                  : "Note tes jours de règles pour suivre ton cycle et ton qada."}
              </p>
            </div>
            <div className="n-week" aria-label="Semaine en cours">
              {week.map((day) => (
                <div
                  key={day.key}
                  className="n-day"
                  data-today={day.isToday}
                  data-period={day.isPeriod}
                >
                  {day.weekday}
                  <b>{day.day}</b>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 lg:col-span-2">
              <p className="flex items-center gap-2 text-[13px] text-(--n-muted)">
                <Lock className="size-3.5 shrink-0" aria-hidden="true" />
                Tes données de cycle sont enregistrées dans ton compte.
              </p>
              <button type="button" onClick={onOpenCycle} className="n-link text-sm">
                Ouvrir le suivi
              </button>
            </div>
          </article>
        )}

        {modules.notes && (
          <article className="n-card n-rise lg:col-span-6" aria-label="Mes notes">
            <div className="flex items-center justify-between gap-3">
              <span className="n-label">Mes notes</span>
              <button type="button" onClick={onOpenNotes} className="n-link text-sm">
                {notes.length > 0 ? "Toutes les notes" : "Écrire une note"}
              </button>
            </div>
            {notes.length > 0 ? (
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {notes.map((note) => (
                  <li key={note.id}>
                    <button
                      type="button"
                      onClick={onOpenNotes}
                      className={`n-note ${note.cardClass}`}
                    >
                      {note.urgent && <span className="n-chip mb-2 text-xs!">Important</span>}
                      {note.title && <strong className="block truncate text-[16px]">{note.title}</strong>}
                      <span className="mt-1 line-clamp-3 block text-[14px]">{note.content}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[15px] text-(--n-muted)">
                Aucune note pour l’instant.
              </p>
            )}
          </article>
        )}

        {modules.tasks && (
          <article className="n-card n-rise lg:col-span-6" aria-label="Tâches du jour">
            <div className="flex items-center justify-between gap-3">
              <span className="n-label">Tâches du jour</span>
              <button type="button" onClick={onOpenNotes} className="n-link text-sm">
                Gérer
              </button>
            </div>
            {tasks.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <label className="flex items-center gap-3 text-[15px]">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        disabled={pendingTaskId === task.id}
                        onChange={(event) => onToggleTask(task.id, event.target.checked)}
                        className="size-4 accent-(--n-sage)"
                      />
                      {task.label}
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[15px] text-(--n-muted)">
                Aucune tâche en cours. Tu peux en ajouter dans Notes.
              </p>
            )}
          </article>
        )}

        <div className="lg:col-span-6">
          {isCustomizing ? (
            <div className="n-card">
              <div className="flex items-center justify-between gap-3">
                <span className="n-label">Modules de cet écran</span>
                <button type="button" onClick={() => setIsCustomizing(false)} className="n-link text-sm">
                  Terminé
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(Object.keys(moduleLabels) as TodayModule[]).map((module) => (
                  <button
                    key={module}
                    type="button"
                    aria-pressed={modules[module]}
                    onClick={() =>
                      setModules((current) => ({ ...current, [module]: !current[module] }))
                    }
                    className={`n-btn ${modules[module] ? "" : "n-btn-ghost"} px-4! py-2.5! text-sm!`}
                  >
                    {modules[module] ? "✓ " : "+ "}
                    {moduleLabels[module]}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[13px] text-(--n-muted)">
                La prochaine prière reste toujours affichée. Ce choix est enregistré sur cet appareil.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsCustomizing(true)}
              className="n-dashed"
            >
              Personnaliser cet écran
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
