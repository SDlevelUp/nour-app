import { useCallback, useState, type FormEvent } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { PrayerTimes } from "@/hooks/use-prayer-times";
import {
  dateKey,
  includeJournalActivities,
  readPlannerActivities,
  writePlannerActivities,
  type PlannerActivity,
} from "./plannerActivities";
import { WeeklyPlanner } from "./WeeklyPlanner";

type PlannerEvent = {
  time: string;
  displayTime?: string;
  title: string;
  detail: string;
  kind: "prayer" | PlannerActivity["kind"];
};

function getPlannerEvents(
  times: PrayerTimes | null,
  activities: PlannerActivity[],
): PlannerEvent[] {
  const prayerEvents: PlannerEvent[] = [
    {
      time: times?.fajr ?? "05:30",
      displayTime: times?.fajr ?? "--:--",
      title: "Fajr & Adhkar du matin",
      detail: "Prière selon son horaire local, puis invocations du matin",
      kind: "prayer",
    },
    {
      time: times?.dhuhr ?? "13:00",
      displayTime: times?.dhuhr ?? "--:--",
      title: "Dhuhr",
      detail: "Prière selon son horaire local",
      kind: "prayer",
    },
    {
      time: times?.asr ?? "16:30",
      displayTime: times?.asr ?? "--:--",
      title: "Asr & Adhkar du soir",
      detail: "Prière selon son horaire local, puis invocations du soir",
      kind: "prayer",
    },
    {
      time: times?.maghrib ?? "19:00",
      displayTime: times?.maghrib ?? "--:--",
      title: "Maghrib",
      detail: "Prière selon son horaire local",
      kind: "prayer",
    },
    {
      time: times?.isha ?? "20:00",
      displayTime: times?.isha ?? "--:--",
      title: "Isha",
      detail: "Prière selon son horaire local",
      kind: "prayer",
    },
  ];
  return [...prayerEvents, ...activities].sort((a, b) =>
    a.time.localeCompare(b.time),
  );
}

type DailyPlannerProps = {
  isExcusePeriod: boolean;
  prayerTimes: PrayerTimes | null;
};

export function DailyPlanner({
  isExcusePeriod,
  prayerTimes,
}: DailyPlannerProps) {
  const today = dateKey(new Date());
  const quranSessions = useQuery(api.quranProgress.forPlanner, {
    fromDate: today,
    toDate: today,
  });
  const scienceSessions = useQuery(api.scienceProgress.forPlanner, {
    fromDate: today,
    toDate: today,
  });
  const [activities, setActivities] = useState(() =>
    readPlannerActivities(today),
  );
  const [view, setView] = useState<"day" | "week">("day");
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityTime, setNewActivityTime] = useState("12:00");
  const journalActivities = [
    ...(quranSessions ?? []).map((session) => ({
      id: `quran-session-${session._id}`,
      time: session.time ?? "07:00",
      title: `Lecture : ${session.passage}`,
      detail: session.pagesOrVerses ?? "Lecture enregistrée dans le journal",
      kind: "quran-session" as const,
    })),
    ...(scienceSessions ?? []).map((session) => ({
      id: `science-session-${session._id}`,
      time: session.time ?? "10:00",
      title: `Étude : ${session.title}`,
      detail: session.lesson,
      kind: "science-session" as const,
    })),
  ];
  const activitiesForToday =
    quranSessions === undefined || scienceSessions === undefined
      ? activities
      : includeJournalActivities(activities, journalActivities);
  const plannerEvents = getPlannerEvents(prayerTimes, activitiesForToday);
  const visiblePlannerEvents = isExcusePeriod
    ? plannerEvents.filter((event) => event.kind !== "prayer")
    : plannerEvents;
  const eventHours = [
    ...new Set(
      visiblePlannerEvents.map((event) => Number(event.time.slice(0, 2))),
    ),
  ];

  const updateTodayActivities = useCallback(
    (nextActivities: PlannerActivity[]) => {
      setActivities(nextActivities);
      writePlannerActivities(today, nextActivities);
    },
    [today],
  );

  const addTodayActivity = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = newActivityTitle.trim();
    if (!title) return;

    updateTodayActivities([
      ...activities,
      {
        id: `custom-${Date.now()}`,
        time: newActivityTime,
        title,
        detail: "À ton initiative",
        kind: "custom",
      },
    ]);
    setNewActivityTitle("");
    setNewActivityTime("12:00");
    setIsAddingActivity(false);
  };

  return (
    <section
      id="dashboard-salah"
      className="scroll-mt-24 rounded-3xl border border-stone-200 bg-white p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
            {view === "day" ? "Planning du jour" : "Vue hebdomadaire"}
          </p>
          <h2 className="mt-2 font-serif text-2xl tracking-tight text-stone-900">
            {view === "day" ? "Planning quotidien" : "Planning de la semaine"}
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-[10px] text-stone-600">
          {prayerTimes ? "Horaires locaux calculés" : "Horaires indicatifs"}
        </span>
      </div>

      <div
        className="mt-4 inline-flex rounded-xl border border-stone-200 bg-stone-50 p-1"
        role="group"
        aria-label="Affichage du planning"
      >
        {(
          [
            { id: "day", label: "Jour" },
            { id: "week", label: "Semaine" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            aria-pressed={view === id}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
              view === id
                ? "bg-white text-emerald-900 shadow-sm"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "day" && (
        <button
          type="button"
          onClick={() => setIsAddingActivity((open) => !open)}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-violet-800 transition hover:bg-violet-50"
          aria-expanded={isAddingActivity}
        >
          {isAddingActivity ? "Fermer" : "Ajouter à mon programme"}
        </button>
      )}

      {view === "day" && isAddingActivity && (
        <form
          onSubmit={addTodayActivity}
          className="mt-3 grid gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-4 sm:grid-cols-[minmax(0,1fr)_130px_auto_auto] sm:items-end"
        >
          <label className="text-xs font-medium text-foreground">
            Ce que je souhaite faire
            <input
              value={newActivityTitle}
              onChange={(event) => setNewActivityTitle(event.target.value)}
              placeholder="Ex. Lire quelques pages"
              maxLength={100}
              required
              className="mt-1.5 h-10 w-full rounded-xl border border-violet-100 bg-white px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            />
          </label>
          <label className="text-xs font-medium text-foreground">
            Heure
            <input
              type="time"
              value={newActivityTime}
              onChange={(event) => setNewActivityTime(event.target.value)}
              required
              className="mt-1.5 h-10 w-full rounded-xl border border-violet-100 bg-white px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            />
          </label>
          <button
            type="submit"
            className="h-10 rounded-xl bg-violet-800 px-4 text-xs font-semibold text-white transition hover:bg-violet-900"
          >
            Ajouter
          </button>
          <button
            type="button"
            onClick={() => setIsAddingActivity(false)}
            className="h-10 rounded-xl px-3 text-xs font-medium text-muted-foreground transition hover:bg-white"
          >
            Annuler
          </button>
        </form>
      )}

      {view === "week" ? (
        <WeeklyPlanner onTodayActivitiesChange={updateTodayActivities} />
      ) : (
        <>
          <p className="mt-3 text-xs leading-5 text-stone-500">
            {prayerTimes
              ? "Les horaires de prière sont calculés selon ta position et la méthode choisie."
              : "Configure ta position dans Réglages pour afficher les horaires de prière locaux."}
          </p>

          {isExcusePeriod && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950">
              <span>
                Période d'indisponibilité active. Focus sur l'écoute du Coran et
                l'étude de la science.
              </span>
            </div>
          )}

          <div className="mt-5 overflow-hidden rounded-2xl border border-stone-100">
            {eventHours.map((hour) => {
              const events = visiblePlannerEvents.filter(
                (event) => Number(event.time.slice(0, 2)) === hour,
              );

              return (
                <div
                  key={hour}
                  className="grid min-h-19 grid-cols-[56px_minmax(0,1fr)] border-b border-stone-100 last:border-b-0 sm:grid-cols-[72px_minmax(0,1fr)]"
                >
                  <div className="border-r border-stone-100 px-2 pt-3 text-right text-[10px] font-semibold tabular-nums text-stone-400 sm:px-4">
                    {String(hour).padStart(2, "0")}:00
                  </div>
                  <div className="space-y-1 p-1.5 sm:p-2">
                    {events.map(
                      ({
                        time,
                        displayTime,
                        title,
                        detail,
                        kind,
                      }) => (
                        <article
                          key={`${kind}-${title}`}
                          className={`rounded-xl border px-3 py-3 ${
                            kind === "prayer"
                              ? "border-stone-200 bg-[#F5F2EE]"
                              : kind.endsWith("-session")
                                ? "border-emerald-200 bg-emerald-50/50"
                                : "border-stone-200 bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 text-[10px] font-semibold tabular-nums text-stone-600">
                              {displayTime ?? time}
                            </span>
                            <div>
                              <h3 className="text-xs font-semibold text-stone-900 sm:text-sm">
                                {title}
                              </h3>
                              <p className="mt-0.5 text-[10px] leading-4 text-stone-600 sm:text-xs">
                                {detail}
                              </p>
                            </div>
                          </div>
                        </article>
                      ),
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
