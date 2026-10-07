export type PlannerActivityKind =
  | "quran"
  | "science"
  | "listening"
  | "custom"
  | "quran-session"
  | "science-session";

export type PlannerActivity = {
  id: string;
  time: string;
  title: string;
  detail: string;
  kind: PlannerActivityKind;
};

export function dateKey(date: Date) {
  return new Intl.DateTimeFormat("fr-CA").format(date);
}

export function getDefaultActivities(): PlannerActivity[] {
  return [
    {
      id: "quran-reading",
      time: "07:00",
      title: "Lecture Al-Qur’an",
      detail: "Pages ou versets à définir",
      kind: "quran",
    },
    {
      id: "science-study",
      time: "10:00",
      title: "Étude de livre de science",
      detail: "Tafsir ou Hadith · lecture et prise de notes",
      kind: "science",
    },
    {
      id: "quran-listening",
      time: "18:00",
      title: "Écoute du Coran",
      detail: "Écoute et révision d’une sourate",
      kind: "listening",
    },
  ];
}

function isPlannerActivity(value: unknown): value is PlannerActivity {
  if (!value || typeof value !== "object") return false;
  const activity = value as Record<string, unknown>;
  return (
    typeof activity.id === "string" &&
    typeof activity.time === "string" &&
    /^\d{2}:\d{2}$/.test(activity.time) &&
    typeof activity.title === "string" &&
    typeof activity.detail === "string" &&
    [
      "quran",
      "science",
      "listening",
      "custom",
      "quran-session",
      "science-session",
    ].includes(String(activity.kind))
  );
}

export function readPlannerActivities(date: string): PlannerActivity[] {
  try {
    const stored = localStorage.getItem(`nour-planner-${date}`);
    if (!stored) return getDefaultActivities();
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.every(isPlannerActivity)
      ? parsed
      : getDefaultActivities();
  } catch {
    return getDefaultActivities();
  }
}

export function writePlannerActivities(
  date: string,
  activities: PlannerActivity[],
) {
  localStorage.setItem(`nour-planner-${date}`, JSON.stringify(activities));
}

export function getWeekDates(referenceDate: Date) {
  const monday = new Date(referenceDate);
  const offset = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - offset);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
}

export function includeJournalActivities(
  activities: PlannerActivity[],
  journalActivities: PlannerActivity[],
) {
  const hasQuranSession = journalActivities.some(
    (activity) => activity.kind === "quran-session",
  );
  const hasScienceSession = journalActivities.some(
    (activity) => activity.kind === "science-session",
  );
  const remainingActivities = activities.filter(
    (activity) =>
      !(hasQuranSession && activity.id === "quran-reading") &&
      !(hasScienceSession && activity.id === "science-study"),
  );
  return [...remainingActivities, ...journalActivities].sort((a, b) =>
    a.time.localeCompare(b.time),
  );
}
