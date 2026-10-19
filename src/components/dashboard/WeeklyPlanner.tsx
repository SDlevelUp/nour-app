import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import {
  dateKey,
  getWeekDates,
  includeJournalActivities,
  readPlannerActivities,
  writePlannerActivities,
  type PlannerActivity,
} from "./plannerActivities";

const times = Array.from({ length: 18 }, (_, index) => {
  const hour = index + 5;
  return `${String(hour).padStart(2, "0")}:00`;
});

function loadWeekActivities(dates: Date[]) {
  return Object.fromEntries(
    dates.map((date) => {
      const key = dateKey(date);
      return [key, readPlannerActivities(key)];
    }),
  );
}

type WeeklyPlannerProps = {
  onTodayActivitiesChange: (activities: PlannerActivity[]) => void;
};

export function WeeklyPlanner({ onTodayActivitiesChange }: WeeklyPlannerProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const referenceDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + weekOffset * 7);
    return date;
  }, [weekOffset]);
  const dates = useMemo(() => getWeekDates(referenceDate), [referenceDate]);
  const firstDateKey = dateKey(dates[0]);
  const lastDateKey = dateKey(dates[6]);
  const today = dateKey(new Date());
  const quranSessions = useQuery(api.quranProgress.forPlanner, {
    fromDate: firstDateKey,
    toDate: lastDateKey,
  });
  const scienceSessions = useQuery(api.scienceProgress.forPlanner, {
    fromDate: firstDateKey,
    toDate: lastDateKey,
  });
  const updateQuranSchedule = useMutation(api.quranProgress.updateSchedule);
  const updateScienceSchedule = useMutation(api.scienceProgress.updateSchedule);
  const removeQuranSession = useMutation(api.quranProgress.remove);
  const removeScienceSession = useMutation(api.scienceProgress.remove);
  const journalActivitiesByDate = new Map<string, PlannerActivity[]>();
  (quranSessions ?? []).forEach((session) => {
    const current = journalActivitiesByDate.get(session.date) ?? [];
    journalActivitiesByDate.set(session.date, [
      ...current,
      {
        id: `quran-session-${session._id}`,
        time: session.time ?? "07:00",
        title: `Lecture : ${session.passage}`,
        detail: session.pagesOrVerses ?? "Lecture enregistrée dans le journal",
        kind: "quran-session",
      },
    ]);
  });
  (scienceSessions ?? []).forEach((session) => {
    const current = journalActivitiesByDate.get(session.date) ?? [];
    journalActivitiesByDate.set(session.date, [
      ...current,
      {
        id: `science-session-${session._id}`,
        time: session.time ?? "10:00",
        title: `Étude : ${session.title}`,
        detail: session.lesson,
        kind: "science-session",
      },
    ]);
  });
  const [activitiesByDate, setActivitiesByDate] = useState<
    Record<string, PlannerActivity[]>
  >(() => loadWeekActivities(getWeekDates(new Date())));
  const [draggedActivity, setDraggedActivity] = useState<{
    date: string;
    activityId: string;
  } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newActivityDate, setNewActivityDate] = useState(today);
  const [newActivityTime, setNewActivityTime] = useState("12:00");
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityDetail, setNewActivityDetail] = useState("");
  const [pendingJournalAction, setPendingJournalAction] = useState<
    string | null
  >(null);

  const saveActivities = (date: string, activities: PlannerActivity[]) => {
    writePlannerActivities(date, activities);
    setActivitiesByDate((current) => ({ ...current, [date]: activities }));
    if (date === today) onTodayActivitiesChange(activities);
  };

  const changeWeek = (offset: number) => {
    const nextOffset = weekOffset + offset;
    const nextReferenceDate = new Date();
    nextReferenceDate.setDate(nextReferenceDate.getDate() + nextOffset * 7);
    const nextDates = getWeekDates(nextReferenceDate);
    const nextActivities = loadWeekActivities(nextDates);
    setActivitiesByDate(nextActivities);
    const todayActivities = nextActivities[today];
    if (todayActivities) onTodayActivitiesChange(todayActivities);
    setWeekOffset(nextOffset);
  };

  const moveActivity = (targetDate: string) => {
    if (!draggedActivity) {
      return;
    }
    const journalActivity = journalActivitiesByDate
      .get(draggedActivity.date)
      ?.find((activity) => activity.id === draggedActivity.activityId);
    if (journalActivity) {
      if (draggedActivity.date !== targetDate) {
        void updateJournalSchedule(
          journalActivity,
          targetDate,
          journalActivity.time,
        );
      }
      setDraggedActivity(null);
      return;
    }
    moveActivityBetweenDates(
      draggedActivity.date,
      draggedActivity.activityId,
      targetDate,
    );
    setDraggedActivity(null);
  };

  const moveActivityBetweenDates = (
    sourceDate: string,
    activityId: string,
    targetDate: string,
  ) => {
    if (sourceDate === targetDate) {
      setDraggedActivity(null);
      return;
    }
    const sourceActivities = activitiesByDate[sourceDate] ?? [];
    const targetActivities = activitiesByDate[targetDate] ?? [];
    const activity = sourceActivities.find((item) => item.id === activityId);
    if (!activity) {
      setDraggedActivity(null);
      return;
    }
    saveActivities(
      sourceDate,
      sourceActivities.filter((item) => item.id !== activity.id),
    );
    saveActivities(
      targetDate,
      [...targetActivities, activity].sort((a, b) =>
        a.time.localeCompare(b.time),
      ),
    );
    setDraggedActivity(null);
  };

  const addActivity = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newActivityTitle.trim()) return;
    const activities = activitiesByDate[newActivityDate] ?? [];
    const activity: PlannerActivity = {
      id: crypto.randomUUID(),
      time: newActivityTime,
      title: newActivityTitle.trim(),
      detail: newActivityDetail.trim() || "Activité personnelle",
      kind: "custom",
    };
    saveActivities(
      newActivityDate,
      [...activities, activity].sort((a, b) => a.time.localeCompare(b.time)),
    );
    setNewActivityTitle("");
    setNewActivityDetail("");
    setIsAdding(false);
  };

  const changeTime = (date: string, activityId: string, time: string) => {
    const activities = activitiesByDate[date] ?? [];
    saveActivities(
      date,
      activities
        .map((activity) =>
          activity.id === activityId ? { ...activity, time } : activity,
        )
        .sort((a, b) => a.time.localeCompare(b.time)),
    );
  };

  const removeActivity = (date: string, activityId: string) => {
    saveActivities(
      date,
      (activitiesByDate[date] ?? []).filter(
        (activity) => activity.id !== activityId,
      ),
    );
  };

  const updateJournalSchedule = async (
    activity: PlannerActivity,
    date: string,
    time: string,
  ) => {
    setPendingJournalAction(activity.id);
    try {
      if (activity.kind === "quran-session") {
        await updateQuranSchedule({
          logId: activity.id.slice(
            "quran-session-".length,
          ) as Id<"quranReadingLogs">,
          date,
          time,
        });
      } else if (activity.kind === "science-session") {
        await updateScienceSchedule({
          logId: activity.id.slice(
            "science-session-".length,
          ) as Id<"scienceStudyLogs">,
          date,
          time,
        });
      }
      toast.success("Session mise à jour dans le planning.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de déplacer cette session.",
      );
    } finally {
      setPendingJournalAction(null);
    }
  };

  const deleteJournalActivity = async (activity: PlannerActivity) => {
    if (!window.confirm("Supprimer cette session du journal et du planning ?"))
      return;
    setPendingJournalAction(activity.id);
    try {
      if (activity.kind === "quran-session") {
        await removeQuranSession({
          logId: activity.id.slice(
            "quran-session-".length,
          ) as Id<"quranReadingLogs">,
        });
      } else if (activity.kind === "science-session") {
        await removeScienceSession({
          logId: activity.id.slice(
            "science-session-".length,
          ) as Id<"scienceStudyLogs">,
        });
      }
      toast.success("Session supprimée du journal et du planning.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer cette session.",
      );
    } finally {
      setPendingJournalAction(null);
    }
  };

  const weekLabel = `${dates[0].toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} – ${dates[6].toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="n-icon-btn"
            onClick={() => changeWeek(-1)}
            aria-label="Semaine précédente"
          >
            <ChevronLeft className="size-4" />
          </button>
          <h3 className="n-display px-1 text-[17px]">{weekLabel}</h3>
          <button
            type="button"
            className="n-icon-btn"
            onClick={() => changeWeek(1)}
            aria-label="Semaine suivante"
          >
            <ChevronRight className="size-4" />
          </button>
          {weekOffset !== 0 && (
            <button
              type="button"
              className="n-link ml-2 text-sm"
              onClick={() => changeWeek(-weekOffset)}
            >
              Cette semaine
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setNewActivityDate(
              dates.some((date) => dateKey(date) === today) ? today : firstDateKey,
            );
            setIsAdding((open) => !open);
          }}
          aria-expanded={isAdding}
          className="n-btn n-btn-ghost px-4! py-2.5! text-sm!"
        >
          <Plus className="size-4" />
          Ajouter une activité
        </button>
      </div>

      {isAdding && (
        <form onSubmit={addActivity} className="n-card grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px_120px]">
          <label className="grid gap-1 text-[13px] font-semibold">
            Activité
            <input
              value={newActivityTitle}
              onChange={(event) => setNewActivityTitle(event.target.value)}
              maxLength={100}
              placeholder="Ex. Révision d’une sourate"
              required
              className="n-input"
            />
          </label>
          <label className="grid gap-1 text-[13px] font-semibold">
            Jour
            <select
              value={newActivityDate}
              onChange={(event) => setNewActivityDate(event.target.value)}
              className="n-select h-11! w-full"
            >
              {dates.map((date) => {
                const key = dateKey(date);
                return (
                  <option key={key} value={key}>
                    {date.toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="grid gap-1 text-[13px] font-semibold">
            Heure
            <input
              type="time"
              value={newActivityTime}
              onChange={(event) => setNewActivityTime(event.target.value)}
              required
              className="n-input"
            />
          </label>
          <label className="grid gap-1 text-[13px] font-semibold sm:col-span-3">
            Détail (facultatif)
            <input
              value={newActivityDetail}
              onChange={(event) => setNewActivityDetail(event.target.value)}
              maxLength={180}
              placeholder="Une précision ou un objectif"
              className="n-input font-normal"
            />
          </label>
          <div className="flex items-center justify-end gap-3 sm:col-span-3">
            <button
              type="button"
              className="n-link text-sm text-(--n-muted)!"
              onClick={() => setIsAdding(false)}
            >
              Annuler
            </button>
            <button type="submit" className="n-btn n-btn-sage">
              Ajouter
            </button>
          </div>
        </form>
      )}

      <div className="n-weekgrid">
        {dates.map((date) => {
          const key = dateKey(date);
          const storedActivities = activitiesByDate[key] ?? [];
          const journalActivities = journalActivitiesByDate.get(key) ?? [];
          const activities =
            quranSessions === undefined || scienceSessions === undefined
              ? storedActivities
              : includeJournalActivities(storedActivities, journalActivities);
          const isCurrentDay = key === today;
          return (
            <section
              key={key}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                moveActivity(key);
              }}
              aria-label={`Activités du ${date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" })}`}
              className="n-weekday"
              data-today={isCurrentDay}
            >
              <header className="n-weekday-head">
                <span>{date.toLocaleDateString("fr-FR", { weekday: "short" })}</span>
                <b>{date.getDate()}</b>
              </header>
              <div className="space-y-2 p-2">
                {activities.map((activity) => {
                  const isJournalSession =
                    activity.kind === "quran-session" || activity.kind === "science-session";
                  return (
                    <article
                      key={activity.id}
                      draggable
                      onDragStart={() => setDraggedActivity({ date: key, activityId: activity.id })}
                      onDragEnd={() => setDraggedActivity(null)}
                      className="n-week-item"
                      data-kind={activity.kind}
                      data-dragging={draggedActivity?.activityId === activity.id}
                    >
                      <div className="flex items-center gap-1">
                        {isJournalSession ? (
                          <input
                            type="time"
                            value={activity.time}
                            onChange={(event) =>
                              void updateJournalSchedule(activity, key, event.target.value)
                            }
                            disabled={pendingJournalAction === activity.id}
                            aria-label={`Heure de ${activity.title}`}
                            className="n-week-time"
                          />
                        ) : (
                          <select
                            value={activity.time}
                            onChange={(event) => changeTime(key, activity.id, event.target.value)}
                            aria-label={`Heure de ${activity.title}`}
                            className="n-week-time"
                          >
                            {!times.includes(activity.time) && (
                              <option value={activity.time}>{activity.time}</option>
                            )}
                            {times.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            isJournalSession
                              ? void deleteJournalActivity(activity)
                              : removeActivity(key, activity.id)
                          }
                          disabled={isJournalSession && pendingJournalAction === activity.id}
                          aria-label={
                            isJournalSession
                              ? `Supprimer ${activity.title} du journal et du planning`
                              : `Supprimer ${activity.title}`
                          }
                          className="n-icon-btn ml-auto size-7!"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                      <p className="mt-1.5 text-[14px] font-semibold leading-5">{activity.title}</p>
                      {activity.detail && (
                        <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-(--n-muted)">
                          {activity.detail}
                        </p>
                      )}
                      <label className="mt-2 block">
                        <span className="sr-only">Déplacer {activity.title} vers un autre jour</span>
                        <select
                          value={key}
                          disabled={isJournalSession && pendingJournalAction === activity.id}
                          onChange={(event) =>
                            isJournalSession
                              ? void updateJournalSchedule(activity, event.target.value, activity.time)
                              : moveActivityBetweenDates(key, activity.id, event.target.value)
                          }
                          className="n-week-move"
                        >
                          {dates.map((targetDate) => {
                            const targetKey = dateKey(targetDate);
                            return (
                              <option key={targetKey} value={targetKey}>
                                {targetKey === key ? "Déplacer vers…" : targetDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" })}
                              </option>
                            );
                          })}
                        </select>
                      </label>
                    </article>
                  );
                })}
                {activities.length === 0 && <p className="n-week-empty">Dépose une activité ici</p>}
              </div>
            </section>
          );
        })}
      </div>
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[13px] text-(--n-muted)">
        <span className="inline-flex items-center gap-1.5">
          <span className="n-week-dot" data-kind="custom" /> Mes activités
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="n-week-dot" data-kind="quran-session" /> Lectures et études notées
        </span>
        <span>Glisse une activité vers un autre jour. Ta semaine est conservée sur cet appareil.</span>
      </p>
    </div>
  );
}
