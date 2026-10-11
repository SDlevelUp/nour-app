import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import {
  dashboardNavigation,
  type DashboardView,
} from "@/components/dashboard/dashboardNavigation";
import { DailyPlanner } from "@/components/dashboard/DailyPlanner";
import { QuranJournal } from "@/components/dashboard/QuranJournal";
import { ScienceJournal } from "@/components/dashboard/ScienceJournal";
import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { api } from "@/convex/_generated/api";
import { adhkarBySession, type AdhkarSession } from "@/convex/adhkarData";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  Archive,
  ArchiveRestore,
  MoonStar,
  Trash2,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

type ReminderPreferences = {
  morning: boolean;
  evening: boolean;
  morningTime: string;
  eveningTime: string;
};

type CycleSymptom = Doc<"cycleDays">["symptoms"][number];
type StickyNoteColor = "yellow" | "pink" | "blue" | "green" | "lavender";

const stickyNoteColors: {
  value: StickyNoteColor;
  label: string;
  card: string;
  swatch: string;
}[] = [
  {
    value: "yellow",
    label: "Jaune",
    card: "border-amber-200 bg-amber-100",
    swatch: "bg-amber-300",
  },
  {
    value: "pink",
    label: "Rose",
    card: "border-rose-200 bg-rose-100",
    swatch: "bg-rose-300",
  },
  {
    value: "blue",
    label: "Bleu",
    card: "border-sky-200 bg-sky-100",
    swatch: "bg-sky-300",
  },
  {
    value: "green",
    label: "Vert",
    card: "border-emerald-200 bg-emerald-100",
    swatch: "bg-emerald-300",
  },
  {
    value: "lavender",
    label: "Prune",
    card: "border-[#D8CBD0] bg-[#F3EFEC]",
    swatch: "bg-[#8B707D]",
  },
];

const defaultReminders: ReminderPreferences = {
  morning: false,
  evening: false,
  morningTime: "06:30",
  eveningTime: "19:30",
};
const morningMessages = [
  "Le moment des invocations du matin est arrivé.",
  "Pensez à votre séquence d’invocations du matin.",
  "Vos invocations du matin sont disponibles dans votre routine.",
];
const eveningMessages = [
  "Le moment des invocations du soir est arrivé.",
  "Pensez à votre séquence d’invocations du soir.",
  "Vos invocations du soir sont disponibles dans votre routine.",
];

const cycleSymptoms: { key: CycleSymptom; label: string }[] = [
  { key: "bloating", label: "Ballonnements" },
  { key: "cramps", label: "Crampes" },
  { key: "fatigue", label: "Fatigue" },
  { key: "headache", label: "Maux de tête" },
  { key: "mood", label: "Humeur changeante" },
  { key: "tender_breasts", label: "Seins sensibles" },
  { key: "other", label: "Autre" },
];

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function todayKey() {
  return new Intl.DateTimeFormat("fr-CA").format(new Date());
}

const dailyEncouragements = [
  "Quelques versets aujourd’hui, à ton rythme.",
  "Pense à noter ta lecture pour la retrouver demain.",
  "Choisis une petite action bénéfique à inscrire à ton planning.",
  "Prends un instant pour les adhkars du matin ou du soir.",
  "Tu peux reprendre là où tu t’es arrêtée, sans chercher à rattraper.",
  "Garde une place dans ta journée pour ce qui compte.",
  "Une petite étape compte aussi.",
];

function QuranHabitTracker({
  today,
  onNavigate,
}: {
  today: string;
  onNavigate: (view: DashboardView) => void;
}) {
  const weekStart = format(subDays(parseISO(today), 6), "yyyy-MM-dd");
  const readings = useQuery(api.quranProgress.forPlanner, {
    fromDate: weekStart,
    toDate: today,
  });
  const readingDates = new Set(readings?.map((reading) => reading.date) ?? []);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = subDays(parseISO(today), 6 - index);
    const key = format(date, "yyyy-MM-dd");
    return {
      key,
      label: format(date, "EEEEE", { locale: fr }),
      date: format(date, "d"),
      completed: readingDates.has(key),
    };
  });
  const completedDays = days.filter((day) => day.completed).length;

  return (
    <section
      aria-label="Habitude de lecture du Coran"
      className="h-fit rounded-3xl border border-stone-200 bg-white p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Habitude de la semaine
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            Lecture du Coran
          </h2>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100/80 text-violet-800">
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Chaque jour où tu notes une lecture apparaît ici.
      </p>

      <div className="mt-5 grid grid-cols-7 gap-1.5" role="list" aria-label="Sept derniers jours">
        {days.map((day) => (
          <div key={day.key} role="listitem" className="text-center">
            <span className="block text-[10px] font-medium uppercase text-muted-foreground">
              {day.label}
            </span>
            <span
              className={`mx-auto mt-2 flex size-8 items-center justify-center rounded-full text-[11px] font-semibold ${day.completed ? "bg-violet-700 text-white" : "bg-violet-50 text-violet-700"}`}
              aria-label={`${day.date}, ${day.completed ? "lecture notée" : "aucune lecture notée"}`}
            >
              {day.date}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">
          {readings === undefined ? "Chargement…" : `${completedDays}/7 jours avec une lecture`}
        </span>
        <span className="text-muted-foreground">À ton rythme</span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-violet-100"
        role="progressbar"
        aria-label="Jours de lecture cette semaine"
        aria-valuemin={0}
        aria-valuemax={7}
        aria-valuenow={completedDays}
      >
        <div
          className="h-full rounded-full bg-violet-600 transition-[width] duration-500"
          style={{ width: `${(completedDays / 7) * 100}%` }}
        />
      </div>

      <button
        type="button"
        onClick={() => onNavigate("quran")}
        className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-violet-800 transition hover:text-violet-950"
      >
        Ajouter une lecture
      </button>
    </section>
  );
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const prayer = usePrayerTimes();
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [isExcusePeriod, setIsExcusePeriod] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() =>
    readStored("nour-sidebar-collapsed", false),
  );
  const [isDarkMode, setIsDarkMode] = useState(() =>
    readStored("nour-dark-mode", false),
  );
  const [adhkarSession, setAdhkarSession] = useState<AdhkarSession>("morning");
  const [isSavingAdhkar, setIsSavingAdhkar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [editingPeriodRange, setEditingPeriodRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [isSavingCycleDay, setIsSavingCycleDay] = useState(false);
  const [personalNoteDraft, setPersonalNoteDraft] = useState("");
  const [personalNoteTitle, setPersonalNoteTitle] = useState("");
  const [personalNoteUrgent, setPersonalNoteUrgent] = useState(false);
  const [personalNoteColor, setPersonalNoteColor] =
    useState<StickyNoteColor>("yellow");
  const [editingPersonalNote, setEditingPersonalNote] =
    useState<Id<"personalNotes"> | null>(null);
  const [editNoteTitle, setEditNoteTitle] = useState("");
  const [editNoteContent, setEditNoteContent] = useState("");
  const [editNoteUrgent, setEditNoteUrgent] = useState(false);
  const [editNoteColor, setEditNoteColor] = useState<StickyNoteColor>("yellow");
  const [draggedNoteId, setDraggedNoteId] =
    useState<Id<"personalNotes"> | null>(null);
  const [isSavingPersonalNote, setIsSavingPersonalNote] = useState(false);
  const [notesSection, setNotesSection] = useState<"active" | "archived">(
    "active",
  );
  const [pendingNoteAction, setPendingNoteAction] = useState<string | null>(
    null,
  );
  const [isSavingLateAlerts, setIsSavingLateAlerts] = useState(false);
  const [reminders, setReminders] = useState<ReminderPreferences>(() =>
    readStored("nour-reminders", defaultReminders),
  );
  const firedToday = useRef<Record<string, string>>({});
  const notifiedLateCycle = useRef<string | null>(null);
  const firstName = user?.name?.trim().split(" ")[0];
  const today = todayKey();
  const reminderDate = parseISO(today);
  const reminderDay = Math.floor(
    Date.UTC(
      reminderDate.getFullYear(),
      reminderDate.getMonth(),
      reminderDate.getDate(),
    ) / 86_400_000,
  );
  const reminderIndex = reminderDay % dailyEncouragements.length;
  const dailyReminder = dailyEncouragements[reminderIndex];
  const historyStart = startOfMonth(subMonths(new Date(), 18));
  const visibleMonthStart = startOfMonth(calendarMonth);
  const visibleMonthEnd = endOfMonth(calendarMonth);
  const fromDate = format(
    new Date(Math.min(historyStart.getTime(), visibleMonthStart.getTime())),
    "yyyy-MM-dd",
  );
  const toDate = format(
    new Date(
      Math.max(endOfMonth(new Date()).getTime(), visibleMonthEnd.getTime()),
    ),
    "yyyy-MM-dd",
  );
  const cycleDays = useQuery(api.cycleTracking.list, { fromDate, toDate });
  const cycleSettings = useQuery(api.cycleTracking.getSettings, {});
  const personalNotes = useQuery(api.personalNotes.list, {});
  const adhkarProgress = useQuery(api.adhkarProgress.forDate, { date: today });
  const saveCycleDay = useMutation(api.cycleTracking.saveDay);
  const setPeriodRange = useMutation(api.cycleTracking.setPeriodRange);
  const updatePeriodRange = useMutation(api.cycleTracking.updatePeriodRange);
  const setLateAlertsEnabled = useMutation(
    api.cycleTracking.setLateAlertsEnabled,
  );
  const addPersonalNote = useMutation(api.personalNotes.add);
  const editPersonalNote = useMutation(api.personalNotes.update);
  const reorderPersonalNotes = useMutation(api.personalNotes.reorder);
  const markPersonalNotesRead = useMutation(api.personalNotes.markAllRead);
  const setPersonalNoteArchived = useMutation(api.personalNotes.setArchived);
  const removePersonalNote = useMutation(api.personalNotes.remove);
  const recordAdhkarRepetition = useMutation(
    api.adhkarProgress.recordRepetition,
  );
  const advanceAdhkar = useMutation(api.adhkarProgress.advance);
  const sessionProgress = adhkarProgress?.find(
    (entry) => entry.session === adhkarSession,
  );
  const adhkarSequence = adhkarBySession[adhkarSession];
  const currentInvocation = adhkarSequence[sessionProgress?.currentIndex ?? 0];
  const currentRepetitionCount = sessionProgress?.repetitionCount ?? 0;
  const isInvocationComplete =
    currentInvocation !== undefined &&
    currentRepetitionCount >= currentInvocation.repetitions;
  const completedMorningAdhkar =
    adhkarProgress?.find((entry) => entry.session === "morning")
      ?.currentIndex ?? 0;
  const completedEveningAdhkar =
    adhkarProgress?.find((entry) => entry.session === "evening")
      ?.currentIndex ?? 0;
  const records = cycleDays ?? [];
  const selectedDayKey = format(selectedDate, "yyyy-MM-dd");
  const selectedEntry = records.find((entry) => entry.date === selectedDayKey);
  const noteDraft = noteDrafts[selectedDayKey] ?? selectedEntry?.note ?? "";
  const periodDates = records
    .filter((entry) => entry.isPeriodDay)
    .map((entry) => parseISO(entry.date));
  const recordedPeriodDates = new Set(
    records.filter((entry) => entry.isPeriodDay).map((entry) => entry.date),
  );
  const periodStarts = [...recordedPeriodDates]
    .sort()
    .filter(
      (date) =>
        !recordedPeriodDates.has(
          format(subDays(parseISO(date), 1), "yyyy-MM-dd"),
        ),
    );
  const periodRuns = [...recordedPeriodDates]
    .sort()
    .reduce<string[][]>((runs, date) => {
      const lastRun = runs[runs.length - 1];
      if (!lastRun) {
        runs.push([date]);
        return runs;
      }
      const previousDate = lastRun[lastRun.length - 1];
      if (
        differenceInCalendarDays(parseISO(date), parseISO(previousDate)) === 1
      )
        lastRun.push(date);
      else runs.push([date]);
      return runs;
    }, []);
  const selectedPeriodRun = periodRuns.find((run) =>
    run.includes(selectedDayKey),
  );
  const cycleNotes = records
    .filter((entry) => entry.note?.trim())
    .sort((first, second) => second.date.localeCompare(first.date));
  const currentPeriodRun = periodRuns.find((run) => run.includes(today));
  const currentPeriodDay = currentPeriodRun
    ? differenceInCalendarDays(new Date(), parseISO(currentPeriodRun[0])) + 1
    : null;
  const completedPeriodRuns = periodRuns.filter(
    (run) => run !== currentPeriodRun,
  );
  const recentPeriodDurations = completedPeriodRuns
    .slice(-3)
    .map((run) => run.length);
  const averagePeriodLength =
    recentPeriodDurations.length > 0
      ? Math.round(
          recentPeriodDurations.reduce((total, length) => total + length, 0) /
            recentPeriodDurations.length,
        )
      : null;
  const periodDaysRemaining =
    currentPeriodDay !== null && averagePeriodLength !== null
      ? Math.max(0, averagePeriodLength - currentPeriodDay)
      : null;
  const recentStarts = periodStarts.slice(-3);
  const cycleIntervals = recentStarts
    .slice(1)
    .map((date, index) =>
      differenceInCalendarDays(parseISO(date), parseISO(recentStarts[index])),
    );
  const averageCycleLength =
    cycleIntervals.length >= 2
      ? Math.round(
          cycleIntervals.reduce((total, interval) => total + interval, 0) /
            cycleIntervals.length,
        )
      : null;
  const latestPeriodStart = periodStarts[periodStarts.length - 1];
  const currentCycleDay = latestPeriodStart
    ? differenceInCalendarDays(new Date(), parseISO(latestPeriodStart)) + 1
    : null;
  const expectedNextPeriod =
    averageCycleLength !== null &&
    averageCycleLength >= 15 &&
    averageCycleLength <= 60
      ? addDays(
          parseISO(recentStarts[recentStarts.length - 1]),
          averageCycleLength,
        )
      : null;
  const daysLate = expectedNextPeriod
    ? differenceInCalendarDays(new Date(), expectedNextPeriod)
    : null;
  const isPeriodLate = daysLate !== null && daysLate > 2;
  const hasUnreadNotes =
    personalNotes?.some((note) => note.isUnread && !note.archived) ?? false;
  const visiblePersonalNotes = personalNotes
    ?.filter((note) =>
      notesSection === "archived"
        ? note.archived === true
        : note.archived !== true,
    )
    .sort(
      (first, second) =>
        (second.position ?? second.createdAt) -
        (first.position ?? first.createdAt),
    );
  const daysTrackedThisMonth = records.filter(
    (entry) =>
      entry.isPeriodDay &&
      entry.date.startsWith(format(calendarMonth, "yyyy-MM")),
  ).length;

  useEffect(() => {
    localStorage.setItem("nour-reminders", JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(
      "nour-sidebar-collapsed",
      JSON.stringify(isSidebarCollapsed),
    );
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem("nour-dark-mode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted")
      return;
    const checkReminders = () => {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const date = todayKey();
      const moments = [
        {
          key: "morning",
          enabled: reminders.morning,
          at: reminders.morningTime,
          messages: morningMessages,
          title: "Un instant pour vous",
        },
        {
          key: "evening",
          enabled: reminders.evening,
          at: reminders.eveningTime,
          messages: eveningMessages,
          title: "Une pause en douceur",
        },
      ];
      moments.forEach(({ key, enabled, at, messages, title }) => {
        if (enabled && time === at && firedToday.current[key] !== date) {
          firedToday.current[key] = date;
          const messageIndex =
            (now.getDate() + (key === "evening" ? 1 : 0)) % messages.length;
          new Notification(title, {
            body: messages[messageIndex],
            tag: `nour-${key}-${date}`,
          });
        }
      });
    };
    checkReminders();
    const timer = window.setInterval(checkReminders, 15_000);
    return () => window.clearInterval(timer);
  }, [reminders]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const updateReminder = async (
    key: "morning" | "evening",
    enabled: boolean,
  ) => {
    if (enabled && !("Notification" in window)) {
      toast.message(
        "Les notifications ne sont pas prises en charge par ce navigateur.",
      );
      return;
    }
    if (enabled && Notification.permission !== "granted") {
      const permission =
        Notification.permission === "default"
          ? await Notification.requestPermission()
          : Notification.permission;
      if (permission !== "granted") {
        toast.message(
          "Autorisez les notifications dans votre navigateur pour activer ce rappel.",
        );
        return;
      }
    }
    setReminders((current) => ({ ...current, [key]: enabled }));
  };

  const saveCycleEntry = async (
    date: string,
    isPeriodDay: boolean,
    symptoms: CycleSymptom[],
    note?: string,
  ) => {
    setIsSavingCycleDay(true);
    try {
      await saveCycleDay({ date, isPeriodDay, symptoms, note });
      return true;
    } catch {
      toast.error("Impossible d’enregistrer cette journée. Réessayez.");
      return false;
    } finally {
      setIsSavingCycleDay(false);
    }
  };

  const saveCycleNote = async () => {
    const saved = await saveCycleEntry(
      selectedDayKey,
      selectedEntry?.isPeriodDay ?? false,
      selectedEntry?.symptoms ?? [],
      noteDraft,
    );
    if (saved) toast.success("Note enregistrée dans le suivi du cycle.");
  };

  const deleteCycleNote = async (entry: (typeof records)[number]) => {
    if (
      !window.confirm(
        `Supprimer la note du ${format(parseISO(entry.date), "d MMMM yyyy", { locale: fr })} ?`,
      )
    ) {
      return;
    }
    const saved = await saveCycleEntry(
      entry.date,
      entry.isPeriodDay,
      entry.symptoms,
      undefined,
    );
    if (saved) {
      setNoteDrafts((current) => {
        const next = { ...current };
        delete next[entry.date];
        return next;
      });
      toast.success("Note supprimée. Les règles et symptômes sont conservés.");
    }
  };

  const saveSelectedPeriodRange = async () => {
    if (!selectedRange?.from || !selectedRange.to) return;
    const startDate = format(selectedRange.from, "yyyy-MM-dd");
    const endDate = format(selectedRange.to, "yyyy-MM-dd");
    if (differenceInCalendarDays(selectedRange.to, selectedRange.from) > 59) {
      toast.error("Sélectionnez une plage de 60 jours maximum.");
      return;
    }
    if (!editingPeriodRange) {
      const overlapsExistingPeriod = records.some(
        (entry) =>
          entry.isPeriodDay && entry.date >= startDate && entry.date <= endDate,
      );
      if (overlapsExistingPeriod) {
        toast.error(
          "Cette plage contient déjà des jours enregistrés. Clique sur « Modifier les dates de cette période » pour la changer.",
        );
        return;
      }
    }
    const isAlreadyRecorded =
      records
        .filter((entry) => entry.date >= startDate && entry.date <= endDate)
        .filter((entry) => entry.isPeriodDay).length ===
      differenceInCalendarDays(selectedRange.to, selectedRange.from) + 1;

    setIsSavingCycleDay(true);
    try {
      if (editingPeriodRange) {
        await updatePeriodRange({
          previousStartDate: editingPeriodRange.startDate,
          previousEndDate: editingPeriodRange.endDate,
          startDate,
          endDate,
        });
        setEditingPeriodRange(null);
        toast.success("Les dates de cette période ont été modifiées.");
      } else {
        await setPeriodRange({
          startDate,
          endDate,
          isPeriodDay: !isAlreadyRecorded,
        });
        toast.success(
          isAlreadyRecorded
            ? "Plage retirée du suivi."
            : "Plage de règles enregistrée.",
        );
      }
    } catch {
      toast.error("Impossible d’enregistrer cette plage. Réessayez.");
    } finally {
      setIsSavingCycleDay(false);
    }
  };

  const toggleSymptom = (symptom: CycleSymptom) => {
    const currentSymptoms = selectedEntry?.symptoms ?? [];
    const nextSymptoms = currentSymptoms.includes(symptom)
      ? currentSymptoms.filter((item) => item !== symptom)
      : [...currentSymptoms, symptom];
    void saveCycleEntry(
      selectedDayKey,
      selectedEntry?.isPeriodDay ?? false,
      nextSymptoms,
      noteDraft,
    );
  };

  const updateLateAlerts = async (enabled: boolean) => {
    setIsSavingLateAlerts(true);
    try {
      if (
        enabled &&
        "Notification" in window &&
        Notification.permission === "default"
      ) {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.message(
            "Les alertes resteront visibles dans l’application, sans notification système.",
          );
        }
      }
      await setLateAlertsEnabled({ enabled });
    } catch {
      toast.error("Impossible d’enregistrer votre préférence de notification.");
    } finally {
      setIsSavingLateAlerts(false);
    }
  };

  const recordCurrentAdhkarRepetition = async () => {
    if (!currentInvocation) return;
    setIsSavingAdhkar(true);
    try {
      await recordAdhkarRepetition({
        date: today,
        session: adhkarSession,
        invocationId: currentInvocation.id,
      });
    } catch {
      toast.error("Impossible d’enregistrer cette récitation. Réessayez.");
    } finally {
      setIsSavingAdhkar(false);
    }
  };

  const continueAdhkar = async () => {
    if (!currentInvocation || !isInvocationComplete) return;
    setIsSavingAdhkar(true);
    try {
      await advanceAdhkar({
        date: today,
        session: adhkarSession,
        invocationId: currentInvocation.id,
      });
    } catch {
      toast.error("Récitez toutes les répétitions avant de passer à la suite.");
    } finally {
      setIsSavingAdhkar(false);
    }
  };

  useEffect(() => {
    if (
      !isPeriodLate ||
      !cycleSettings?.lateAlertsEnabled ||
      !expectedNextPeriod ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    ) {
      return;
    }
    const alertKey = `${user?._id ?? "user"}-${format(expectedNextPeriod, "yyyy-MM-dd")}`;
    if (notifiedLateCycle.current === alertKey) return;
    notifiedLateCycle.current = alertKey;
    new Notification("Petit rappel de suivi", {
      body: "La date estimée de vos règles est passée. Les cycles peuvent varier : consultez votre calendrier quand vous le souhaitez.",
      tag: `nour-cycle-late-${alertKey}`,
    });
  }, [
    cycleSettings?.lateAlertsEnabled,
    expectedNextPeriod,
    isPeriodLate,
    user?._id,
  ]);

  const navigateToView = (view: DashboardView) => {
    setActiveView(view);
    if (view === "notes" && hasUnreadNotes) {
      void markPersonalNotesRead({}).catch(() => {
        toast.error("Impossible de mettre à jour les notifications de notes.");
      });
    }
    requestAnimationFrame(() => {
      document
        .getElementById(
          dashboardNavigation.find((item) => item.view === view)?.targetId ??
            "",
        )
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const openAdhkarSession = (session: AdhkarSession) => {
    setAdhkarSession(session);
    document.getElementById("dashboard-routine")?.setAttribute("open", "");
    requestAnimationFrame(() => {
      document
        .getElementById("dashboard-routine")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const savePersonalNote = async () => {
    setIsSavingPersonalNote(true);
    try {
      await addPersonalNote({
        content: personalNoteDraft,
        title: personalNoteTitle || undefined,
        urgent: personalNoteUrgent,
        color: personalNoteColor,
      });
      setPersonalNoteDraft("");
      setPersonalNoteTitle("");
      setPersonalNoteUrgent(false);
      setPersonalNoteColor("yellow");
      toast.success("Note enregistrée.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer la note. Réessayez.",
      );
    } finally {
      setIsSavingPersonalNote(false);
    }
  };

  const savePersonalNoteEdits = async (noteId: Id<"personalNotes">) => {
    setPendingNoteAction(noteId);
    try {
      await editPersonalNote({
        noteId,
        title: editNoteTitle,
        content: editNoteContent,
        urgent: editNoteUrgent,
        color: editNoteColor,
      });
      setEditingPersonalNote(null);
      toast.success("Post-it modifié.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de modifier ce post-it.",
      );
    } finally {
      setPendingNoteAction(null);
    }
  };

  const reorderPersonalNote = async (targetNoteId: Id<"personalNotes">) => {
    if (!draggedNoteId || draggedNoteId === targetNoteId) return;
    const archived = notesSection === "archived";
    const notes = (personalNotes ?? [])
      .filter((note) => (note.archived === true) === archived)
      .sort(
        (first, second) =>
          (second.position ?? second.createdAt) -
          (first.position ?? first.createdAt),
      );
    const fromIndex = notes.findIndex((note) => note._id === draggedNoteId);
    const toIndex = notes.findIndex((note) => note._id === targetNoteId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [movedNote] = notes.splice(fromIndex, 1);
    notes.splice(toIndex, 0, movedNote);
    try {
      await reorderPersonalNotes({
        archived,
        noteIds: notes.map((note) => note._id),
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de réorganiser les post-it.",
      );
    } finally {
      setDraggedNoteId(null);
    }
  };

  const updatePersonalNoteArchive = async (
    noteId: Id<"personalNotes">,
    archived: boolean,
  ) => {
    setPendingNoteAction(noteId);
    try {
      await setPersonalNoteArchived({ noteId, archived });
      toast.success(archived ? "Note archivée." : "Note restaurée.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de modifier cette note.",
      );
    } finally {
      setPendingNoteAction(null);
    }
  };

  const deletePersonalNote = async (noteId: Id<"personalNotes">) => {
    if (
      !window.confirm(
        "Supprimer définitivement cette note ? Cette action est irréversible.",
      )
    ) {
      return;
    }

    setPendingNoteAction(noteId);
    try {
      await removePersonalNote({ noteId });
      toast.success("Note supprimée.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer cette note.",
      );
    } finally {
      setPendingNoteAction(null);
    }
  };

  return (
    <main
      className={`dashboard-shell min-h-screen bg-[#f7f5fb] text-stone-900 ${isDarkMode ? "dark-dashboard" : ""}`}
    >
      <DashboardSidebar
        activeView={activeView}
        firstName={firstName || ""}
        email={user?.email}
        hasUnreadNotes={hasUnreadNotes}
        isExcusePeriod={isExcusePeriod}
        isCollapsed={isSidebarCollapsed}
        isDarkMode={isDarkMode}
        onNavigate={navigateToView}
        onExcusePeriodChange={setIsExcusePeriod}
        onCollapse={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        onDarkModeChange={setIsDarkMode}
        onSignOut={() => void handleSignOut()}
      />
      <div
        className={`min-h-screen bg-[#f7f5fb] transition-[padding] duration-300 ease-in-out ${isSidebarCollapsed ? "lg:pl-18" : "lg:pl-65"}`}
      >
        <header className="border-b border-violet-100 bg-white/90">
          {activeView === "overview" ? (
            <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6 xl:px-8">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-sm">
                  <MoonStar className="size-5" />
                </span>
                <span className="text-lg font-bold tracking-tight text-stone-900">nour</span>
              </div>
              <span className="text-sm font-medium text-stone-500">Ton espace quotidien</span>
            </div>
          ) : (
          <div className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.6fr)] lg:items-center xl:px-8">
            <div className="min-w-0">
              <p className="text-base font-semibold text-stone-900">
                {new Intl.DateTimeFormat("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date())}
              </p>
              <p className="mt-1 text-[14px] leading-5 text-stone-500">
                {new Intl.DateTimeFormat("fr-FR-u-ca-islamic", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date())}
                <span className="mt-0.5 block text-[14px] text-stone-400">
                  Date hégirienne indicative
                </span>
              </p>
            </div>

            <div className="min-w-0">
              <p className="mb-2 text-[14px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                {prayer.times
                  ? "Horaires calculés pour votre position"
                  : "Horaires locaux · à configurer"}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Fajr", time: prayer.times?.fajr },
                  { name: "Dhuhr", time: prayer.times?.dhuhr },
                  { name: "Asr", time: prayer.times?.asr },
                  { name: "Maghrib", time: prayer.times?.maghrib },
                  { name: "Isha", time: prayer.times?.isha },
                ].map(({ name, time }) => (
                  <span
                    key={name}
                    className="inline-flex w-fit items-center gap-1 rounded-xl border border-stone-200/80 bg-white/70 px-1.5 py-1 text-[14px] text-stone-600"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <span className="font-medium">{name}</span>
                      <span className="tabular-nums text-stone-500">
                        {time ?? (prayer.isLoading ? "…" : "--:--")}
                      </span>
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => void handleSignOut()}
              className="self-end gap-2 text-stone-600 hover:text-stone-950 xl:hidden"
              aria-label="Se déconnecter"
            >
              Quitter
            </Button>
          </div>
          )}
        </header>

        <div className="mx-auto mt-3 min-h-[calc(100vh-100px)] max-w-[1600px] rounded-t-3xl border border-b-0 border-violet-100 bg-white px-4 pb-12 pt-6 sm:mt-4 sm:px-6 xl:px-8">
          <div
            className={`grid items-start gap-6 xl:gap-8 ${activeView === "settings" ? "xl:grid-cols-[minmax(0,1fr)_360px]" : "xl:grid-cols-1"}`}
          >
            <section className="min-w-0 space-y-4">
              {(activeView === "overview" ||
                activeView === "salah" ||
                activeView === "quran" ||
                activeView === "science") && (
                <>
                  {activeView === "overview" && (
                    <div
                      id="dashboard-home"
                      className="scroll-mt-24 rounded-[28px] bg-gradient-to-br from-[#38245f] to-[#694a9d] p-5 text-white shadow-lg shadow-violet-200/40 sm:p-7"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-violet-100">Espace personnel</p>
                          <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                            Salam, {firstName || "bienvenue"}
                          </h1>
                          <p className="mt-1.5 text-sm text-violet-100">{dailyReminder}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeView === "overview" && (
                    <section aria-label="Tes repères quotidiens" className="grid gap-3 sm:grid-cols-2">
                      <button type="button" onClick={() => navigateToView("salah")} className="rounded-2xl border border-violet-100 bg-[#f7f4fb] p-4 text-left transition hover:border-violet-200 hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:p-5">
                        <span className="text-sm font-semibold text-violet-800">Horaires de prière</span>
                        <span className="mt-4 flex flex-wrap gap-2">
                          {[
                            { name: "Fajr", time: prayer.times?.fajr },
                            { name: "Dhuhr", time: prayer.times?.dhuhr },
                            { name: "Asr", time: prayer.times?.asr },
                            { name: "Maghrib", time: prayer.times?.maghrib },
                            { name: "Isha", time: prayer.times?.isha },
                          ].map(({ name, time }) => (
                            <span key={name} className="rounded-full bg-white px-2.5 py-1.5 text-[11px] text-stone-600 shadow-sm">{name}{time ? ` ${time}` : ""}</span>
                          ))}
                        </span>
                      </button>

                      <button type="button" onClick={() => openAdhkarSession("morning")} className="rounded-2xl border border-emerald-100 bg-[#f1f6ef] p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 sm:p-5">
                        <span className="text-sm font-semibold text-emerald-900">Routine du jour</span>
                        <span className="mt-3 block text-sm text-stone-600">Adhkar du matin et du soir</span>
                        <span className="mt-1 block text-xs text-stone-500">{completedMorningAdhkar}/{adhkarBySession.morning.length} matin · {completedEveningAdhkar}/{adhkarBySession.evening.length} soir</span>
                      </button>

                      <button type="button" onClick={() => navigateToView("quran")} className="rounded-2xl border border-violet-100 bg-white p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:p-5">
                        <span className="text-sm font-semibold text-violet-800">Journal Al-Qur’an</span>
                        <span className="mt-3 block text-sm text-stone-600">Note ta lecture et retrouve le passage où tu t’es arrêtée.</span>
                      </button>

                      <button type="button" onClick={() => navigateToView("periods")} className="rounded-2xl border border-emerald-100 bg-[#f1f6ef] p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 sm:p-5">
                        <span className="text-sm font-semibold text-emerald-900">Mes repères</span>
                        <span className="mt-3 block text-sm text-stone-600">{currentPeriodDay !== null ? `Jour ${currentPeriodDay} · suivi personnel` : currentCycleDay !== null && currentCycleDay <= 60 ? `Jour ${currentCycleDay} du cycle` : "Cycle et planning adapté"}</span>
                        <span className="mt-1 block text-xs text-stone-500">{isExcusePeriod ? "Mode Al-‘Udhr actif" : "Tes informations restent personnelles"}</span>
                      </button>
                    </section>
                  )}

                  {activeView === "overview" && (
                    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
                      <DailyPlanner
                        isExcusePeriod={isExcusePeriod}
                        prayerTimes={prayer.times}
                      />
                      <QuranHabitTracker
                        today={today}
                        onNavigate={navigateToView}
                      />
                    </div>
                  )}

                  {activeView === "salah" && (
                    <DailyPlanner
                      isExcusePeriod={isExcusePeriod}
                      prayerTimes={prayer.times}
                    />
                  )}

                  {activeView === "quran" && <QuranJournal />}

                  {activeView === "science" && <ScienceJournal />}

                  {activeView === "overview" && (
                    <details
                      id="dashboard-routine"
                      className="scroll-mt-24 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6"
                    >
                      <summary className="cursor-pointer list-none">
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
                              Adhkar authentiques
                            </p>
                            <h2 className="mt-2 font-serif text-xl tracking-tight">
                              Ouvrir les invocations du matin et du soir
                            </h2>
                          </div>
                        </div>
                      </summary>

                      <div className="flex gap-2 rounded-full border border-stone-200 bg-stone-50 p-1">
                        {(
                          [
                            {
                              id: "morning",
                              label: "Invocations du matin",
                            },
                            {
                              id: "evening",
                              label: "Invocations du soir",
                            },
                          ] as const
                        ).map(({ id, label }) => {
                          const progress = adhkarProgress?.find(
                            (entry) => entry.session === id,
                          );
                          const completed = Math.min(
                            progress?.currentIndex ?? 0,
                            adhkarBySession[id].length,
                          );
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setAdhkarSession(id)}
                              aria-pressed={adhkarSession === id}
                              className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-xs font-medium transition sm:text-sm ${
                                adhkarSession === id
                                  ? "bg-[#523B46] text-white shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <span className="truncate">{label}</span>
                              <span className="shrink-0 text-[10px]">
                                {completed}/{adhkarBySession[id].length}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 rounded-3xl border border-stone-200 bg-white p-4 sm:p-6">
                        {adhkarProgress === undefined ? (
                          <p className="py-10 text-center text-sm text-muted-foreground">
                            Chargement de votre routine…
                          </p>
                        ) : currentInvocation ? (
                          <>
                            <div className="flex items-center justify-between gap-3">
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-900">
                                Invocation{" "}
                                {(sessionProgress?.currentIndex ?? 0) + 1} sur{" "}
                                {adhkarSequence.length}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                À réciter {currentInvocation.repetitions} fois
                              </span>
                            </div>
                            <div
                              className="mt-5 text-right text-2xl leading-[2.2] text-foreground sm:text-3xl"
                              lang="ar"
                              dir="rtl"
                            >
                              {currentInvocation.arabic}
                            </div>
                            <h3 className="study-prose mt-5 text-xl">
                              {currentInvocation.title}
                            </h3>
                            <p className="study-prose mt-2 text-sm italic text-muted-foreground">
                              {currentInvocation.transliteration}
                            </p>
                            <p className="study-prose mt-3 text-sm text-foreground">
                              {currentInvocation.meaning}
                            </p>
                            <p className="mt-3 text-[10px] text-muted-foreground">
                              Source : {currentInvocation.source}
                            </p>

                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                              <Button
                                type="button"
                                variant={
                                  isInvocationComplete ? "outline" : "default"
                                }
                                disabled={
                                  isSavingAdhkar ||
                                  adhkarProgress === undefined ||
                                  isInvocationComplete
                                }
                                onClick={() =>
                                  void recordCurrentAdhkarRepetition()
                                }
                                className={`min-h-11 flex-1 rounded-full ${isInvocationComplete ? "" : "bg-[#523B46] text-white hover:bg-[#3D2A34]"}`}
                              >
                                {isInvocationComplete ? (
                                  <>
                                    Invocation terminée
                                  </>
                                ) : (
                                  `J’ai récité (${currentRepetitionCount}/${currentInvocation.repetitions})`
                                )}
                              </Button>
                              <Button
                                type="button"
                                disabled={
                                  !isInvocationComplete || isSavingAdhkar
                                }
                                onClick={() => void continueAdhkar()}
                                className="min-h-11 flex-1 rounded-full bg-[#523B46] text-white hover:bg-[#3D2A34]"
                              >
                                Invocation suivante
                              </Button>
                            </div>
                            {!isInvocationComplete && (
                              <p className="mt-3 text-center text-xs text-muted-foreground">
                                Marquez chaque récitation ; vous pourrez
                                continuer une fois le nombre demandé atteint.
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="py-8 text-center">
                            <h3 className="mt-4 font-serif text-2xl">
                              Routine terminée, bravo
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Vous avez terminé les invocations{" "}
                              {adhkarSession === "morning"
                                ? "du matin"
                                : "du soir"}{" "}
                              aujourd’hui.
                            </p>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </>
              )}

              {activeView === "periods" && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="rounded-3xl border-stone-200 bg-white shadow-none">
                      <CardContent className="p-4">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500">
                          Jours de règles notés
                        </p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
                          {daysTrackedThisMonth}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          ce mois-ci
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-3xl border-stone-200 bg-white shadow-none">
                      <CardContent className="p-4">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500">
                          Débuts de cycle notés
                        </p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
                          {periodStarts.length}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          d’après votre calendrier
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div
                    id="dashboard-status"
                    className="scroll-mt-24 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
                          Périodes d’excuse
                        </p>
                        <h2 className="mt-2 font-serif text-2xl tracking-tight">
                          Suivi du cycle
                        </h2>
                      </div>
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        Privé · enregistré sur votre compte
                      </span>
                    </div>

                    {isPeriodLate && expectedNextPeriod && (
                      <div className="mb-5 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                        <p className="font-semibold">
                          Votre cycle est peut-être un peu en retard
                        </p>
                        <p className="mt-1 leading-6">
                          D’après les journées que vous avez notées, la date
                          estimée était le{" "}
                          {format(expectedNextPeriod, "d MMMM", { locale: fr })}
                          . Les cycles varient naturellement ; cette estimation
                          n’est pas un avis médical.
                        </p>
                      </div>
                    )}

                    <div className="mb-5 grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-stone-500">
                          Durée moyenne des règles
                        </p>
                        <p className="mt-1 text-base font-semibold text-stone-900">
                          {averagePeriodLength
                            ? `${averagePeriodLength} jour${averagePeriodLength === 1 ? "" : "s"}`
                            : "À calculer"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-500">
                          Durée moyenne du cycle
                        </p>
                        <p className="mt-1 text-base font-semibold text-stone-900">
                          {averageCycleLength
                            ? `${averageCycleLength} jours`
                            : "À calculer"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-500">
                          Prochaines règles estimées
                        </p>
                        <p className="mt-1 text-base font-semibold text-stone-900">
                          {expectedNextPeriod
                            ? format(expectedNextPeriod, "d MMMM yyyy", {
                                locale: fr,
                              })
                            : "Note au moins 3 débuts de cycle"}
                        </p>
                      </div>
                      <p className="text-xs leading-5 text-stone-500 sm:col-span-3">
                        Estimations fondées sur les cycles enregistrés ; elles
                        peuvent varier et ne constituent pas un avis médical.
                      </p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                      <div className="min-w-0 rounded-3xl border border-primary/10 bg-[#F5F2EE] p-2 sm:p-4">
                        <Calendar
                          mode="range"
                          selected={selectedRange}
                          onSelect={(range) => {
                            setSelectedRange(range);
                            const focusedDate = range?.to ?? range?.from;
                            if (focusedDate) setSelectedDate(focusedDate);
                          }}
                          month={calendarMonth}
                          onMonthChange={setCalendarMonth}
                          locale={fr}
                          modifiers={{ period: periodDates }}
                          modifiersClassNames={{
                            period:
                              "bg-rose-100 font-semibold text-rose-800 hover:bg-rose-200",
                          }}
                          className="mx-auto w-full max-w-md"
                        />
                        <div className="flex items-center justify-center gap-2 pb-2 text-xs text-muted-foreground">
                          <span className="size-3 rounded-full bg-rose-200" />
                          Règles déjà notées
                        </div>
                      </div>

                      <div
                        id="cycle-day-editor"
                        className="rounded-3xl border border-primary/10 bg-white p-4 sm:p-5"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                          {selectedRange?.from
                            ? selectedRange.to
                              ? `${format(selectedRange.from, "d MMM", { locale: fr })} – ${format(selectedRange.to, "d MMM yyyy", { locale: fr })}`
                              : `Début : ${format(selectedRange.from, "d MMMM yyyy", { locale: fr })}`
                            : format(selectedDate, "EEEE d MMMM yyyy", {
                                locale: fr,
                              })}
                        </p>
                        <h3 className="mt-2 font-serif text-xl">
                          Votre période
                        </h3>

                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          {editingPeriodRange
                            ? "Choisissez les nouvelles dates de début et de fin dans le calendrier."
                            : "Choisissez les dates de début et de fin dans le calendrier."}
                        </p>

                        {selectedPeriodRun && !editingPeriodRange && (
                          <button
                            type="button"
                            onClick={() => {
                              const startDate = selectedPeriodRun[0];
                              const endDate =
                                selectedPeriodRun[selectedPeriodRun.length - 1];
                              setEditingPeriodRange({ startDate, endDate });
                              setSelectedRange({
                                from: parseISO(startDate),
                                to: parseISO(endDate),
                              });
                            }}
                            className="mt-3 text-sm font-medium text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
                          >
                            Modifier les dates de cette période
                          </button>
                        )}
                        {editingPeriodRange && (
                          <p className="mt-3 text-sm font-medium text-emerald-800">
                            Modification des dates de cette période
                          </p>
                        )}
                        {editingPeriodRange && (
                          <>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              <label className="text-sm font-medium text-stone-700">
                                Début des règles
                                <Input
                                  type="date"
                                  value={
                                    selectedRange?.from
                                      ? format(selectedRange.from, "yyyy-MM-dd")
                                      : editingPeriodRange.startDate
                                  }
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    if (!value) return;
                                    const from = parseISO(value);
                                    setSelectedRange((current) => ({
                                      from,
                                      to:
                                        current?.to && current.to >= from
                                          ? current.to
                                          : from,
                                    }));
                                    setSelectedDate(from);
                                    setCalendarMonth(startOfMonth(from));
                                  }}
                                  className="mt-1 w-full text-base md:text-base"
                                />
                              </label>
                              <label className="text-sm font-medium text-stone-700">
                                Fin des règles
                                <Input
                                  type="date"
                                  value={
                                    selectedRange?.to
                                      ? format(selectedRange.to, "yyyy-MM-dd")
                                      : editingPeriodRange.endDate
                                  }
                                  min={
                                    selectedRange?.from
                                      ? format(selectedRange.from, "yyyy-MM-dd")
                                      : editingPeriodRange.startDate
                                  }
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    if (!value) return;
                                    const to = parseISO(value);
                                    setSelectedRange((current) => ({
                                      from: current?.from ?? to,
                                      to,
                                    }));
                                    setSelectedDate(to);
                                    setCalendarMonth(startOfMonth(to));
                                  }}
                                  className="mt-1 w-full text-base md:text-base"
                                />
                              </label>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingPeriodRange(null)}
                              className="mt-3 text-sm text-stone-500 underline underline-offset-2 hover:text-stone-800"
                            >
                              Annuler la modification
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          disabled={
                            cycleDays === undefined ||
                            isSavingCycleDay ||
                            !selectedRange?.from ||
                            !selectedRange.to
                          }
                          onClick={() => void saveSelectedPeriodRange()}
                          className="mt-4 w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-sm font-medium text-rose-900 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {editingPeriodRange
                            ? "Enregistrer les nouvelles dates"
                            : "Enregistrer cette plage de règles"}
                        </button>

                        <p className="mt-5 text-sm font-medium">
                          Observations personnelles (facultatif)
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {cycleSymptoms.map(({ key, label }) => {
                            const selected =
                              selectedEntry?.symptoms.includes(key) ?? false;
                            return (
                              <button
                                key={key}
                                type="button"
                                disabled={
                                  cycleDays === undefined || isSavingCycleDay
                                }
                                aria-pressed={selected}
                                onClick={() => toggleSymptom(key)}
                                className={`rounded-full border px-3 py-2 text-xs transition disabled:cursor-wait disabled:opacity-60 ${
                                  selected
                                    ? "border-primary bg-primary text-white"
                                    : "border-primary/15 bg-white text-muted-foreground hover:border-primary/30 hover:text-foreground"
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>

                        <label
                          htmlFor="cycle-personal-note"
                          className="mt-5 block text-base font-medium"
                        >
                          Note personnelle{" "}
                          <span className="font-normal text-muted-foreground">
                            (facultatif)
                          </span>
                        </label>
                        <Textarea
                          id="cycle-personal-note"
                          value={noteDraft}
                          maxLength={2000}
                          disabled={cycleDays === undefined || isSavingCycleDay}
                          onChange={(event) =>
                            setNoteDrafts((current) => ({
                              ...current,
                              [selectedDayKey]: event.target.value,
                            }))
                          }
                          placeholder="Ajoutez ici une note que vous souhaitez retrouver plus tard…"
                          className="mt-2 min-h-24 resize-y rounded-2xl border-stone-200 bg-stone-50 text-base md:text-base"
                        />
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <p className="text-xs tabular-nums text-muted-foreground">
                            {noteDraft.length}/2 000
                          </p>
                          <Button
                            type="button"
                            onClick={() => void saveCycleNote()}
                            disabled={
                              cycleDays === undefined || isSavingCycleDay
                            }
                            className="bg-emerald-900 text-[15px] text-white hover:bg-emerald-800"
                          >
                            Enregistrer la note
                          </Button>
                        </div>
                        <p
                          className="mt-4 min-h-5 text-xs text-muted-foreground"
                          aria-live="polite"
                        >
                          {cycleDays === undefined
                            ? "Chargement de votre calendrier…"
                            : isSavingCycleDay
                              ? "Enregistrement…"
                              : "Les notes restent dans le suivi du cycle et sont enregistrées pour la date sélectionnée."}
                        </p>

                        <div className="mt-5 border-t border-border/70 pt-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium">
                                Alerte si mes règles tardent
                              </p>
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                Estimation après trois cycles notés ;
                                notification navigateur lorsque l’application
                                est ouverte.
                              </p>
                            </div>
                            <Switch
                              checked={
                                cycleSettings?.lateAlertsEnabled ?? false
                              }
                              disabled={
                                cycleSettings === undefined ||
                                isSavingLateAlerts
                              }
                              onCheckedChange={(enabled) =>
                                void updateLateAlerts(enabled)
                              }
                              aria-label="Activer les alertes de retard de règles"
                            />
                          </div>
                          {expectedNextPeriod === null && (
                            <p className="mt-3 text-xs text-muted-foreground">
                              Notez plusieurs cycles pour que l’application
                              puisse proposer une estimation personnalisée.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      <section
                        aria-labelledby="cycle-notes-heading"
                        className="min-w-0 rounded-3xl border border-stone-200 bg-white p-4 sm:p-5"
                      >
                        <h3
                          id="cycle-notes-heading"
                          className="font-serif text-xl font-semibold"
                        >
                          Notes du cycle
                        </h3>
                        <p className="mt-1 text-sm text-stone-500">
                          Tes notes enregistrées par date.
                        </p>
                        {cycleDays === undefined ? (
                          <p className="mt-4 text-sm text-stone-500">
                            Chargement des notes…
                          </p>
                        ) : cycleNotes.length === 0 ? (
                          <p className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm text-stone-500">
                            Aucune note pour le moment. Sélectionne une date,
                            écris une note et enregistre-la.
                          </p>
                        ) : (
                          <ul className="mt-4 space-y-2">
                            {cycleNotes.map((entry) => (
                              <li
                                key={entry._id}
                                className="flex items-start gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-3"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    const date = parseISO(entry.date);
                                    setSelectedDate(date);
                                    setSelectedRange(undefined);
                                    setCalendarMonth(startOfMonth(date));
                                    requestAnimationFrame(() =>
                                      document
                                        .getElementById("cycle-day-editor")
                                        ?.scrollIntoView({
                                          behavior: "smooth",
                                          block: "center",
                                        }),
                                    );
                                  }}
                                  className="min-w-0 flex-1 text-left"
                                >
                                  <time
                                    dateTime={entry.date}
                                    className="text-sm font-medium text-emerald-800"
                                  >
                                    {format(
                                      parseISO(entry.date),
                                      "d MMMM yyyy",
                                      { locale: fr },
                                    )}
                                  </time>
                                  <p className="mt-1 whitespace-pre-wrap text-base leading-6 text-stone-800">
                                    {entry.note}
                                  </p>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void deleteCycleNote(entry)}
                                  disabled={isSavingCycleDay}
                                  aria-label={`Supprimer la note du ${format(parseISO(entry.date), "d MMMM yyyy", { locale: fr })}`}
                                  className="shrink-0 rounded-lg p-2 text-stone-400 transition hover:bg-rose-100 hover:text-rose-700 disabled:opacity-50"
                                >
                                  Supprimer
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </section>

                      <section
                        aria-labelledby="cycle-symptoms-heading"
                        className="min-w-0 rounded-3xl border border-stone-200 bg-white p-4 sm:p-5"
                      >
                        <h3
                          id="cycle-symptoms-heading"
                          className="font-serif text-xl font-semibold"
                        >
                          Symptômes notés
                        </h3>
                        <p className="mt-1 text-sm text-stone-500">
                          Retrouve les symptômes associés à chaque date.
                        </p>
                        {cycleDays === undefined ? (
                          <p className="mt-4 text-sm text-stone-500">
                            Chargement des symptômes…
                          </p>
                        ) : records.filter((entry) => entry.symptoms.length > 0)
                            .length === 0 ? (
                          <p className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm text-stone-500">
                            Aucun symptôme noté. Sélectionne une date dans le
                            calendrier et choisis les symptômes observés.
                          </p>
                        ) : (
                          <ul className="mt-4 space-y-2">
                            {[...records]
                              .filter((entry) => entry.symptoms.length > 0)
                              .sort((first, second) =>
                                second.date.localeCompare(first.date),
                              )
                              .map((entry) => (
                                <li key={entry._id}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const date = parseISO(entry.date);
                                      setSelectedDate(date);
                                      setSelectedRange(undefined);
                                      setCalendarMonth(startOfMonth(date));
                                      requestAnimationFrame(() =>
                                        document
                                          .getElementById("cycle-day-editor")
                                          ?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "center",
                                          }),
                                      );
                                    }}
                                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
                                  >
                                    <time
                                      dateTime={entry.date}
                                      className="text-sm font-medium text-emerald-800"
                                    >
                                      {format(
                                        parseISO(entry.date),
                                        "d MMMM yyyy",
                                        { locale: fr },
                                      )}
                                    </time>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      {entry.symptoms.map((symptom) => (
                                        <span
                                          key={symptom}
                                          className="rounded-full bg-rose-50 px-2.5 py-1 text-sm text-rose-800"
                                        >
                                          {cycleSymptoms.find(
                                            (item) => item.key === symptom,
                                          )?.label ?? symptom}
                                        </span>
                                      ))}
                                    </div>
                                  </button>
                                </li>
                              ))}
                          </ul>
                        )}
                      </section>
                    </div>

                    {cycleDays?.length === 0 && (
                      <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
                        Votre calendrier est vide pour le moment. Sélectionnez
                        une date pour commencer ; vous pourrez modifier ou
                        retirer vos entrées à tout moment.
                      </p>
                    )}
                  </div>
                </>
              )}

              {activeView === "notes" && (
                <section
                  id="dashboard-notes"
                  className="scroll-mt-24 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-900">
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
                        Espace personnel
                      </p>
                      <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight">
                        Notes
                      </h1>
                    </div>
                  </div>

                  <form
                    className="mt-5 rounded-3xl border border-stone-200 bg-[#F5F2EE] p-4 sm:p-5"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void savePersonalNote();
                    }}
                  >
                    <label className="block text-[15px] font-medium text-stone-800">
                      Titre du post-it
                      <Input
                        value={personalNoteTitle}
                        onChange={(event) =>
                          setPersonalNoteTitle(event.target.value)
                        }
                        maxLength={100}
                        placeholder="Ex. Appeler l’enseignante"
                        className="mt-1.5 bg-white text-base md:text-base"
                      />
                    </label>
                    <label
                      htmlFor="personal-note"
                      className="mt-4 block text-[15px] font-medium text-stone-800"
                    >
                      Contenu
                    </label>
                    <Textarea
                      id="personal-note"
                      value={personalNoteDraft}
                      onChange={(event) =>
                        setPersonalNoteDraft(event.target.value)
                      }
                      maxLength={5000}
                      placeholder="Écris ton idée ou ton rappel…"
                      className="mt-1.5 min-h-28 resize-y rounded-2xl border-stone-200 bg-white text-base md:text-base"
                    />
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <fieldset>
                        <legend className="mb-2 text-[15px] font-medium text-stone-700">
                          Couleur du post-it
                        </legend>
                        <div className="flex gap-2">
                          {stickyNoteColors.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => setPersonalNoteColor(color.value)}
                              aria-label={color.label}
                              aria-pressed={personalNoteColor === color.value}
                              className={`size-8 rounded-full border-2 ${color.swatch} ${personalNoteColor === color.value ? "border-stone-800 ring-2 ring-white ring-offset-1" : "border-white"}`}
                            />
                          ))}
                        </div>
                      </fieldset>
                      <label className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[15px] font-medium text-rose-800">
                        <input
                          type="checkbox"
                          checked={personalNoteUrgent}
                          onChange={(event) =>
                            setPersonalNoteUrgent(event.target.checked)
                          }
                          className="size-4 accent-rose-700"
                        />
                        Urgent
                      </label>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-[15px] tabular-nums text-stone-500">
                        {personalNoteDraft.length}/5 000
                      </span>
                      <Button
                        type="submit"
                        disabled={
                          !personalNoteDraft.trim() ||
                          personalNoteDraft.length > 5000 ||
                          personalNoteTitle.length > 100 ||
                          isSavingPersonalNote
                        }
                        className="rounded-xl bg-[#523B46] text-[15px] text-white hover:bg-[#3D2A34]"
                      >
                        {isSavingPersonalNote
                          ? "Enregistrement…"
                          : "Ajouter un post-it"}
                      </Button>
                    </div>
                  </form>

                  <div className="mt-7 border-t border-stone-200 pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-base font-semibold text-stone-900">
                        {notesSection === "active"
                          ? "Mes notes"
                          : "Notes archivées"}
                      </h2>
                      <div className="flex rounded-xl border border-stone-200 bg-stone-50 p-1">
                        {(
                          [
                            { id: "active", label: "Notes" },
                            { id: "archived", label: "Archivées" },
                          ] as const
                        ).map(({ id, label }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setNotesSection(id)}
                            aria-pressed={notesSection === id}
                            className={`rounded-lg px-3 py-1.5 text-[15px] font-medium transition-colors ${
                              notesSection === id
                                ? "bg-white text-stone-900 shadow-sm"
                                : "text-stone-500 hover:text-stone-900"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {visiblePersonalNotes === undefined ? (
                      <p className="mt-4 text-base text-stone-500">
                        Chargement de vos notes…
                      </p>
                    ) : visiblePersonalNotes.length === 0 ? (
                      <p className="mt-4 rounded-2xl bg-stone-50 p-4 text-base leading-6 text-stone-600">
                        {notesSection === "archived"
                          ? "Aucune note archivée pour le moment."
                          : "Aucun post-it pour le moment. Ajoute ta première note juste au-dessus."}
                      </p>
                    ) : (
                      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {visiblePersonalNotes.map((note) => {
                          const noteColor =
                            stickyNoteColors.find(
                              (color) =>
                                color.value === (note.color ?? "yellow"),
                            ) ?? stickyNoteColors[0];
                          const noteTitle =
                            note.title?.trim() ||
                            note.content.split("\n")[0].slice(0, 60) ||
                            "Post-it";
                          const isEditing = editingPersonalNote === note._id;
                          return (
                            <li
                              key={note._id}
                              draggable={!isEditing}
                              onDragStart={(event) => {
                                setDraggedNoteId(note._id);
                                event.dataTransfer.effectAllowed = "move";
                                event.dataTransfer.setData(
                                  "text/plain",
                                  note._id,
                                );
                              }}
                              onDragEnd={() => setDraggedNoteId(null)}
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) => {
                                event.preventDefault();
                                void reorderPersonalNote(note._id);
                              }}
                              className={`group relative min-h-56 list-none rounded-sm border p-4 shadow-[2px_5px_12px_rgba(70,50,30,0.12)] transition duration-200 hover:-translate-y-1 hover:rotate-0 hover:shadow-[4px_9px_18px_rgba(70,50,30,0.17)] ${noteColor.card} ${draggedNoteId === note._id ? "scale-95 opacity-40" : ""} ${!isEditing && !note.archived ? "cursor-grab active:cursor-grabbing" : ""}`}
                            >
                              <span className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rounded-full border border-white/70 bg-white/65 shadow-sm" />
                              {isEditing ? (
                                <form
                                  className="relative z-10 space-y-3"
                                  onSubmit={(event) => {
                                    event.preventDefault();
                                    void savePersonalNoteEdits(note._id);
                                  }}
                                >
                                  <Input
                                    value={editNoteTitle}
                                    onChange={(event) =>
                                      setEditNoteTitle(event.target.value)
                                    }
                                    maxLength={100}
                                    aria-label="Titre du post-it"
                                    className="border-black/10 bg-white/60 text-base font-semibold md:text-base"
                                  />
                                  <Textarea
                                    value={editNoteContent}
                                    onChange={(event) =>
                                      setEditNoteContent(event.target.value)
                                    }
                                    maxLength={5000}
                                    aria-label="Contenu du post-it"
                                    className="min-h-24 border-black/10 bg-white/60 text-base md:text-base"
                                  />
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex gap-1.5">
                                      {stickyNoteColors.map((color) => (
                                        <button
                                          key={color.value}
                                          type="button"
                                          onClick={() =>
                                            setEditNoteColor(color.value)
                                          }
                                          aria-label={color.label}
                                          aria-pressed={
                                            editNoteColor === color.value
                                          }
                                          className={`size-7 rounded-full border-2 ${color.swatch} ${editNoteColor === color.value ? "border-stone-800 ring-2 ring-white ring-offset-1" : "border-white"}`}
                                        />
                                      ))}
                                    </div>
                                    <label className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-800">
                                      <input
                                        type="checkbox"
                                        checked={editNoteUrgent}
                                        onChange={(event) =>
                                          setEditNoteUrgent(
                                            event.target.checked,
                                          )
                                        }
                                        className="size-4 accent-rose-700"
                                      />
                                      Urgent
                                    </label>
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setEditingPersonalNote(null)
                                      }
                                    >
                                      Annuler
                                    </Button>
                                    <Button
                                      type="submit"
                                      size="sm"
                                      disabled={
                                        pendingNoteAction === note._id ||
                                        !editNoteTitle.trim() ||
                                        !editNoteContent.trim()
                                      }
                                      className="bg-emerald-900 text-white hover:bg-emerald-800"
                                    >
                                      Enregistrer
                                    </Button>
                                  </div>
                                </form>
                              ) : (
                                <>
                                  <div className="relative z-10 flex items-start justify-between gap-2">
                                    <time
                                      className="text-[13px] text-stone-600"
                                      dateTime={new Date(
                                        note.createdAt,
                                      ).toISOString()}
                                    >
                                      {new Date(
                                        note.createdAt,
                                      ).toLocaleDateString("fr-FR", {
                                        dateStyle: "medium",
                                      })}
                                    </time>
                                  </div>
                                  {note.urgent && (
                                    <span className="relative z-10 mt-3 inline-flex rounded-full bg-rose-700 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                                      Urgent
                                    </span>
                                  )}
                                  <h3 className="relative z-10 mt-3 wrap-break-words font-serif text-xl font-semibold leading-6 text-stone-900">
                                    {noteTitle}
                                  </h3>
                                  <p className="relative z-10 mt-2 min-h-12 whitespace-pre-wrap wrap-break-words text-base leading-6 text-stone-800">
                                    {note.content}
                                  </p>
                                  <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-black/10 pt-3">
                                    <button
                                      type="button"
                                      disabled={pendingNoteAction === note._id}
                                      onClick={() => {
                                        setEditingPersonalNote(note._id);
                                        setEditNoteTitle(
                                          note.title ?? noteTitle,
                                        );
                                        setEditNoteContent(note.content);
                                        setEditNoteUrgent(note.urgent ?? false);
                                        setEditNoteColor(
                                          note.color ?? "yellow",
                                        );
                                      }}
                                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-stone-700 hover:bg-white/50 disabled:opacity-50"
                                    >
                                      Modifier
                                    </button>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        disabled={
                                          pendingNoteAction === note._id
                                        }
                                        onClick={() =>
                                          void updatePersonalNoteArchive(
                                            note._id,
                                            !note.archived,
                                          )
                                        }
                                        aria-label={
                                          note.archived
                                            ? "Restaurer le post-it"
                                            : "Archiver le post-it"
                                        }
                                        title={
                                          note.archived
                                            ? "Restaurer"
                                            : "Archiver"
                                        }
                                        className="inline-flex size-8 items-center justify-center rounded-lg text-stone-700 hover:bg-white/50 disabled:opacity-50"
                                      >
                                        {note.archived ? (
                                          <ArchiveRestore className="size-4" />
                                        ) : (
                                          <Archive className="size-4" />
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        disabled={
                                          pendingNoteAction === note._id
                                        }
                                        onClick={() =>
                                          void deletePersonalNote(note._id)
                                        }
                                        aria-label="Supprimer définitivement ce post-it"
                                        title="Supprimer"
                                        className="inline-flex size-8 items-center justify-center rounded-lg text-stone-700 hover:bg-rose-100 hover:text-rose-800 disabled:opacity-50"
                                      >
                                        <Trash2 className="size-4" />
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </section>
              )}
            </section>

            {activeView === "settings" && (
              <section
                id="dashboard-settings"
                className="scroll-mt-24 px-1 pb-1"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
                  Préférences de l’application
                </p>
                <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight">
                  Réglages
                </h1>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Choisissez votre méthode de calcul et autorisez la position de
                  votre appareil pour afficher les horaires de prière locaux.
                  Vous trouverez aussi ici les réglages des rappels.
                </p>
              </section>
            )}

            {activeView === "settings" && (
              <aside
                className="grid items-start gap-5 md:grid-cols-2"
              >
                <Card className="rounded-3xl border border-stone-200 bg-white shadow-none">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                      </span>
                      <div>
                        <p className="text-sm font-semibold">
                          Horaires de prière
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Calcul gratuit selon votre position
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-5 text-stone-600">
                      Votre position est enregistrée sur cet appareil et envoyée
                      à AlAdhan pour calculer les horaires. Elle n’est pas
                      enregistrée dans votre compte Nour.
                    </p>

                    <div className="mt-4 space-y-3">
                      <label className="block text-xs font-medium text-stone-700">
                        Méthode de calcul
                        <select
                          value={prayer.preferences.method}
                          onChange={(event) =>
                            prayer.setMethod(Number(event.target.value))
                          }
                          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800"
                        >
                          {prayer.calculationMethods.map((method) => (
                            <option key={method.id} value={method.id}>
                              {method.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block text-xs font-medium text-stone-700">
                        Calcul de l’heure d’Asr
                        <select
                          value={prayer.preferences.school}
                          onChange={(event) =>
                            prayer.setSchool(event.target.value === "1" ? 1 : 0)
                          }
                          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800"
                        >
                          <option value={0}>
                            Standard (Shafi‘i, Maliki, Hanbali)
                          </option>
                          <option value={1}>Hanafi</option>
                        </select>
                      </label>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={prayer.requestLocation}
                        disabled={prayer.isLoading}
                        className="gap-2"
                      >
                        {prayer.isLoading
                          ? "Recherche…"
                          : prayer.preferences.coordinates
                            ? "Actualiser ma position"
                            : "Utiliser ma position"}
                      </Button>
                      {prayer.preferences.coordinates && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={prayer.clearLocation}
                        >
                          Effacer la position
                        </Button>
                      )}
                    </div>

                    {prayer.error && (
                      <p
                        role="alert"
                        className="mt-3 text-xs leading-5 text-red-700"
                      >
                        {prayer.error}
                      </p>
                    )}
                    {prayer.times && (
                      <p
                        className="mt-3 text-xs text-emerald-800"
                        role="status"
                      >
                        Horaires du jour chargés.
                      </p>
                    )}
                    <p className="mt-3 text-[10px] leading-4 text-stone-500">
                      Horaires calculés par{" "}
                      <a
                        href="https://aladhan.com/prayer-times-api"
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-2"
                      >
                        AlAdhan
                      </a>
                      . Ils peuvent différer des horaires de votre mosquée.
                    </p>
                  </CardContent>
                </Card>

                <Card
                  id="dashboard-reminders"
                  className="scroll-mt-24 rounded-3xl border border-stone-200 bg-white shadow-none"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                      </span>
                      <div>
                        <p className="text-sm font-semibold">Rappels</p>
                        <p className="text-xs text-muted-foreground">
                          Notifications du navigateur
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">
                      <ReminderRow
                        label="Matin"
                        time={reminders.morningTime}
                        enabled={reminders.morning}
                        onTimeChange={(value) =>
                          setReminders((current) => ({
                            ...current,
                            morningTime: value,
                          }))
                        }
                        onToggle={(value) =>
                          void updateReminder("morning", value)
                        }
                      />
                      <div className="border-t border-border/70" />
                      <ReminderRow
                        label="Soir"
                        time={reminders.eveningTime}
                        enabled={reminders.evening}
                        onTimeChange={(value) =>
                          setReminders((current) => ({
                            ...current,
                            eveningTime: value,
                          }))
                        }
                        onToggle={(value) =>
                          void updateReminder("evening", value)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </aside>
            )}
          </div>

          <footer className="mt-10 flex flex-col gap-2 border-t border-stone-200 pt-5 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
            <span>nour. · Suivi quotidien personnel</span>
            <span>
              Votre calendrier est enregistré sur votre compte ; les préférences
              de rappel sont enregistrées sur cet appareil.
            </span>
          </footer>
        </div>
      </div>
    </main>
  );
}

function ReminderRow({
  label,
  time,
  enabled,
  onTimeChange,
  onToggle,
}: {
  label: string;
  time: string;
  enabled: boolean;
  onTimeChange: (value: string) => void;
  onToggle: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <label className="text-xs font-medium">{label}</label>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <input
            type="time"
            value={time}
            onChange={(event) => onTimeChange(event.target.value)}
            className="w-18 bg-transparent tabular-nums outline-none"
            aria-label={`Heure du rappel ${label}`}
          />
        </div>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        aria-label={`Activer le rappel ${label}`}
      />
    </div>
  );
}
