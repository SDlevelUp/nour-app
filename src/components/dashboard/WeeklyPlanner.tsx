import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Headphones,
  Plus,
  Trash2,
} from "lucide-react";
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

  const weekLabel = `${dates[0].toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} – ${dates[6].toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-stone-800">
            Semaine du {weekLabel}
          </h3>
          <p className="mt-1 text-[15px] leading-5 text-stone-500">
            Déplace une activité sur un autre jour ou modifie son heure. Les
            horaires de prière restent calculés à part.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => changeWeek(-1)}
            aria-label="Semaine précédente"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => changeWeek(-weekOffset)}
            disabled={weekOffset === 0}
          >
            Aujourd’hui
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => changeWeek(1)}
            aria-label="Semaine suivante"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[15px] text-stone-500">
          <CalendarDays className="size-4 text-emerald-800" />
          Activités répétées chaque jour par défaut
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setNewActivityDate(
              dates.some((date) => dateKey(date) === today)
                ? today
                : firstDateKey,
            );
            setIsAdding((open) => !open);
          }}
          className="gap-1.5"
        >
          <Plus className="size-4" />
          Ajouter une activité
        </Button>
      </div>

      {isAdding && (
        <form
          onSubmit={addActivity}
          className="mt-3 grid gap-3 rounded-2xl bg-[#F5F2EE] p-4 sm:grid-cols-2"
        >
          <label className="text-base font-medium text-stone-700">
            Activité
            <Input
              value={newActivityTitle}
              onChange={(event) => setNewActivityTitle(event.target.value)}
              maxLength={100}
              placeholder="Ex. Révision d’une sourate"
              required
              className="mt-1.5 bg-white text-base md:text-base"
            />
          </label>
          <label className="text-base font-medium text-stone-700">
            Jour
            <select
              value={newActivityDate}
              onChange={(event) => setNewActivityDate(event.target.value)}
              className="mt-1.5 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-base"
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
          <label className="text-base font-medium text-stone-700">
            Heure
            <Input
              type="time"
              value={newActivityTime}
              onChange={(event) => setNewActivityTime(event.target.value)}
              required
              className="mt-1.5 bg-white text-base md:text-base"
            />
          </label>
          <label className="text-base font-medium text-stone-700">
            Détail{" "}
            <span className="font-normal text-stone-500">(facultatif)</span>
            <Textarea
              value={newActivityDetail}
              onChange={(event) => setNewActivityDetail(event.target.value)}
              maxLength={180}
              rows={1}
              placeholder="Une précision ou un objectif"
              className="mt-1.5 min-h-10 bg-white text-base md:text-base"
            />
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAdding(false)}
            >
              Annuler
            </Button>
            <Button type="submit" className="gap-1.5 bg-emerald-900">
              <Plus className="size-4" />
              Ajouter
            </Button>
          </div>
        </form>
      )}

      <div className="mt-4 pb-2">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
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
                className={`min-h-72 rounded-2xl border p-3 ${
                  isCurrentDay
                    ? "border-emerald-300 bg-emerald-50/50"
                    : "border-stone-200 bg-stone-50/60"
                }`}
              >
                <div className="border-b border-stone-200 pb-2 text-center">
                  <p className="text-[15px] font-medium capitalize text-stone-500">
                    {date.toLocaleDateString("fr-FR", { weekday: "short" })}
                  </p>
                  <p
                    className={`mt-0.5 text-base font-semibold ${isCurrentDay ? "text-emerald-900" : "text-stone-800"}`}
                  >
                    {date.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <div className="mt-3 space-y-2.5">
                  {activities.map((activity) => {
                    const isJournalSession =
                      activity.kind === "quran-session" ||
                      activity.kind === "science-session";
                    const Icon =
                      activity.kind === "science" ||
                      activity.kind === "science-session"
                        ? GraduationCap
                        : activity.kind === "listening"
                          ? Headphones
                          : BookOpen;
                    return (
                      <article
                        key={activity.id}
                        draggable
                        onDragStart={() =>
                          setDraggedActivity({
                            date: key,
                            activityId: activity.id,
                          })
                        }
                        onDragEnd={() => setDraggedActivity(null)}
                        className={`rounded-xl border bg-white p-3 shadow-sm ${
                          activity.kind === "custom"
                            ? "border-[#D8CBD0]"
                            : isJournalSession
                              ? "border-emerald-200 bg-emerald-50/50"
                              : "border-stone-200"
                        } cursor-grab active:cursor-grabbing ${draggedActivity?.activityId === activity.id ? "opacity-40" : ""}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className="size-3.5 shrink-0 text-emerald-800" />
                          {isJournalSession ? (
                            <>
                              <Input
                                type="time"
                                value={activity.time}
                                onChange={(event) =>
                                  void updateJournalSchedule(
                                    activity,
                                    key,
                                    event.target.value,
                                  )
                                }
                                disabled={pendingJournalAction === activity.id}
                                aria-label={`Heure de ${activity.title}`}
                                className="h-8 w-28 bg-stone-50 px-2 text-[15px] tabular-nums"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  void deleteJournalActivity(activity)
                                }
                                disabled={pendingJournalAction === activity.id}
                                aria-label={`Supprimer ${activity.title} du journal et du planning`}
                                className="ml-auto rounded p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <select
                                value={activity.time}
                                onChange={(event) =>
                                  changeTime(
                                    key,
                                    activity.id,
                                    event.target.value,
                                  )
                                }
                                aria-label={`Heure de ${activity.title}`}
                                className="min-w-0 rounded border-0 bg-stone-50 px-1.5 py-1 text-[15px] font-semibold tabular-nums text-stone-700"
                              >
                                {!times.includes(activity.time) && (
                                  <option value={activity.time}>
                                    {activity.time}
                                  </option>
                                )}
                                {times.map((time) => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => removeActivity(key, activity.id)}
                                aria-label={`Supprimer ${activity.title}`}
                                className="ml-auto rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-700"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </>
                          )}
                        </div>
                        <p className="mt-2 text-base font-semibold leading-5 text-stone-900">
                          {activity.title}
                        </p>
                        {activity.detail && (
                          <p className="mt-1 line-clamp-3 text-[15px] leading-5 text-stone-500">
                            {activity.detail}
                          </p>
                        )}
                        <label className="mt-2 block">
                          <span className="sr-only">
                            Déplacer {activity.title} vers un autre jour
                          </span>
                          <select
                            value={key}
                            disabled={
                              isJournalSession &&
                              pendingJournalAction === activity.id
                            }
                            onChange={(event) =>
                              isJournalSession
                                ? void updateJournalSchedule(
                                    activity,
                                    event.target.value,
                                    activity.time,
                                  )
                                : moveActivityBetweenDates(
                                    key,
                                    activity.id,
                                    event.target.value,
                                  )
                            }
                            className="w-full rounded border border-stone-100 bg-white px-2 py-1.5 text-[15px] text-stone-600 disabled:opacity-50"
                          >
                            {dates.map((targetDate) => {
                              const targetKey = dateKey(targetDate);
                              return (
                                <option key={targetKey} value={targetKey}>
                                  {targetDate.toLocaleDateString("fr-FR", {
                                    weekday: "short",
                                    day: "numeric",
                                  })}
                                </option>
                              );
                            })}
                          </select>
                        </label>
                      </article>
                    );
                  })}
                  {activities.length === 0 && (
                    <p className="rounded-lg border border-dashed border-stone-200 px-2 py-6 text-center text-[15px] text-stone-400">
                      Dépose une activité ici
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
      <p className="text-[15px] text-stone-400">
        Fais glisser une activité vers un autre jour ou utilise le menu de
        déplacement. Ta semaine est conservée sur cet appareil.
      </p>
    </div>
  );
}
