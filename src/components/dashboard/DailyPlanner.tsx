import { useCallback, useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
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
  id?: string;
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
  initialView?: "day" | "week";
  titleOverride?: string;
};

export function DailyPlanner({
  isExcusePeriod,
  prayerTimes,
  initialView = "day",
  titleOverride,
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
  const [view, setView] = useState<"day" | "week">(initialView);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityTime, setNewActivityTime] = useState("12:00");
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
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
  const toMinutes = (time: string) =>
    Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
  const nextEventIndex = visiblePlannerEvents.findIndex(
    (event) => toMinutes(event.time) > nowMinutes,
  );

  const updateTodayActivities = useCallback(
    (nextActivities: PlannerActivity[]) => {
      setActivities(nextActivities);
      writePlannerActivities(today, nextActivities);
    },
    [today],
  );

  const removeTodayActivity = (id: string) => {
    updateTodayActivities(activities.filter((activity) => activity.id !== id));
  };

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
    <section id="dashboard-salah" className="n-card scroll-mt-24">
      <div className="n-page-head">
        <div>
          <span className="n-label">
            {titleOverride ?? (prayerTimes ? "Horaires de ta ville" : "Horaires indicatifs")}
          </span>
          <h1 className="n-page-title">
            {view === "day" ? "Ta journée" : "Ta semaine"}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="n-seg" role="group" aria-label="Affichage du planning">
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
              >
                {label}
              </button>
            ))}
          </div>
          {view === "day" && (
            <button
              type="button"
              onClick={() => setIsAddingActivity((open) => !open)}
              className={`n-btn ${isAddingActivity ? "n-btn-ghost" : ""} px-4! py-2.5! text-sm!`}
              aria-expanded={isAddingActivity}
            >
              {isAddingActivity ? "Fermer" : "+ Ajouter"}
            </button>
          )}
        </div>
      </div>

      {view === "day" && isAddingActivity && (
        <form
          onSubmit={addTodayActivity}
          className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px_auto] sm:items-end"
        >
          <label className="text-sm font-semibold">
            Ce que je souhaite faire
            <input
              value={newActivityTitle}
              onChange={(event) => setNewActivityTitle(event.target.value)}
              placeholder="Ex. Lire quelques pages"
              maxLength={100}
              required
              autoFocus
              className="n-input mt-1.5"
            />
          </label>
          <label className="text-sm font-semibold">
            Heure
            <input
              type="time"
              value={newActivityTime}
              onChange={(event) => setNewActivityTime(event.target.value)}
              required
              className="n-input mt-1.5"
            />
          </label>
          <button type="submit" className="n-btn n-btn-sage h-11">
            Ajouter
          </button>
        </form>
      )}

      {view === "week" ? (
        <WeeklyPlanner onTodayActivitiesChange={updateTodayActivities} />
      ) : (
        <>
          <p className="mt-3 text-sm text-(--n-muted)">
            {prayerTimes
              ? "Les horaires de prière sont calculés selon ta position (méthode de la Ligue islamique mondiale)."
              : "Configure ta position dans Réglages pour afficher les horaires de prière locaux."}
          </p>

          {isExcusePeriod && (
            <p className="n-chip mt-4">
              Période d’indisponibilité active : les prières sont masquées.
              Focus sur l’écoute du Coran et l’étude.
            </p>
          )}

          <ol className="n-agenda mt-6" aria-label="Programme du jour">
            {visiblePlannerEvents.map((event, index) => {
              const state =
                index === nextEventIndex
                  ? "next"
                  : nextEventIndex === -1 || index < nextEventIndex
                    ? "past"
                    : "upcoming";
              return (
                <li key={event.id ?? `${event.kind}-${event.title}`}>
                  {index === nextEventIndex && (
                    <p className="n-now" aria-label="Maintenant">
                      Maintenant · {now.toTimeString().slice(0, 5)}
                    </p>
                  )}
                  <div
                    className="n-agenda-item"
                    data-state={state}
                    data-kind={event.kind === "prayer" ? "prayer" : "activity"}
                  >
                    <span className="n-agenda-time">
                      {event.displayTime ?? event.time}
                    </span>
                    <span className="n-agenda-rail" aria-hidden="true">
                      <i className="n-agenda-dot" />
                    </span>
                    <div className="n-agenda-body">
                      <p className="n-agenda-title">{event.title}</p>
                      <p className="n-agenda-detail">
                        {state === "next" ? "À venir · " : ""}
                        {event.detail}
                      </p>
                    </div>
                    {event.kind === "custom" && event.id ? (
                      <button
                        type="button"
                        onClick={() => removeTodayActivity(event.id!)}
                        className="n-icon-btn"
                        aria-label={`Retirer « ${event.title} » du programme`}
                        title="Retirer du programme"
                      >
                        <X className="size-4" />
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          {visiblePlannerEvents.length === 0 && (
            <p className="mt-6 text-[15px] text-(--n-muted)">
              Rien de prévu pour l’instant. Ajoute ce que tu souhaites faire aujourd’hui.
            </p>
          )}
        </>
      )}
    </section>
  );
}
