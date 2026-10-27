import { Switch } from "@/components/ui/switch";
import { CycleCalendar } from "@/components/dashboard/CycleCalendar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { TopActions } from "@/components/dashboard/TopActions";
import { NourMark } from "@/components/NourMark";
import {
  dashboardNavigation,
  type DashboardView,
} from "@/components/dashboard/dashboardNavigation";
import { DailyPlanner } from "@/components/dashboard/DailyPlanner";
import { QuranJournal } from "@/components/dashboard/QuranJournal";
import {
  quranResumeEvent,
  readQuranResumePosition,
  resumePositionFromReadingLog,
  type QuranResumePosition,
} from "@/components/dashboard/quranPlaybackResume";
import { ScienceJournal } from "@/components/dashboard/ScienceJournal";
import { TodayView } from "@/components/dashboard/TodayView";
import { prayerCalculation, usePrayerTimes } from "@/hooks/use-prayer-times";
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
import { Archive, ArchiveRestore, LocateFixed, MapPin, Menu, Trash2 } from "lucide-react";
import { PlaceSearch } from "@/components/dashboard/PlaceSearch";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type ReminderPreferences = {
  morning: boolean;
  evening: boolean;
  morningTime: string;
  eveningTime: string;
};

type CycleSymptom = Doc<"cycleDays">["symptoms"][number];
type StickyNoteColor = "yellow" | "mauve" | "blue" | "green" | "lavender";
type PersonalNoteDraft = {
  title: string;
  content: string;
  urgent: boolean;
  color: StickyNoteColor;
  isTask: boolean;
};

function personalNoteDraftKey(userId: string) {
  return `nour-personal-note-draft:${userId}`;
}

function readPersonalNoteDraft(userId: string): PersonalNoteDraft {
  const emptyDraft: PersonalNoteDraft = {
    title: "",
    content: "",
    urgent: false,
    color: "yellow",
    isTask: false,
  };
  try {
    const stored = localStorage.getItem(personalNoteDraftKey(userId));
    if (!stored) return emptyDraft;
    const value = JSON.parse(stored) as Partial<PersonalNoteDraft>;
    const validColors: StickyNoteColor[] = [
      "yellow",
      "mauve",
      "blue",
      "green",
      "lavender",
    ];
    return {
      title: typeof value.title === "string" ? value.title : "",
      content: typeof value.content === "string" ? value.content : "",
      urgent: value.urgent === true,
      color: validColors.includes(value.color as StickyNoteColor)
        ? (value.color as StickyNoteColor)
        : "yellow",
      isTask: value.isTask === true,
    };
  } catch {
    return emptyDraft;
  }
}

const stickyNoteColors: {
  value: StickyNoteColor;
  label: string;
  card: string;
  swatch: string;
}[] = [
  {
    value: "yellow",
    label: "Jaune",
    card: "note-color-yellow",
    swatch: "bg-[#FFD230]",
  },
  {
    value: "mauve",
    label: "Mauve",
    card: "note-color-mauve",
    swatch: "bg-[#cfbcdb]",
  },
  {
    value: "blue",
    label: "Bleu",
    card: "note-color-blue",
    swatch: "bg-[#73D4FF]",
  },
  {
    value: "green",
    label: "Vert",
    card: "note-color-green",
    swatch: "bg-[#5FE9B5]",
  },
  {
    value: "lavender",
    label: "Rouge",
    card: "note-color-lavender",
    swatch: "bg-[#FF6467]",
  },
];

const defaultReminders: ReminderPreferences = {
  morning: false,
  evening: false,
  morningTime: "06:30",
  eveningTime: "19:30",
};
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

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isAnonymousUser = user?.isAnonymous === true;
  const prayer = usePrayerTimes();
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  // Le lecteur du Coran reste monté après la première visite : l'écoute
  // continue pendant la navigation, dans une mini-fenêtre.
  const [hasOpenedQuran, setHasOpenedQuran] = useState(false);
  if (activeView === "quran" && !hasOpenedQuran) setHasOpenedQuran(true);
  const [isExcusePeriod, setIsExcusePeriod] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() =>
    readStored("nour-sidebar-collapsed", false),
  );
  const [isDarkMode, setIsDarkMode] = useState(() =>
    readStored("nour-dark-mode", false),
  );
  const [adhkarSession, setAdhkarSession] = useState<AdhkarSession>("morning");
  const [showAdhkarTransliteration, setShowAdhkarTransliteration] =
    useState(true);
  const [showAdhkarTranslation, setShowAdhkarTranslation] = useState(true);
  const [quranResumePosition, setQuranResumePosition] = useState(
    readQuranResumePosition,
  );
  const [quranResumeRequest, setQuranResumeRequest] =
    useState<QuranResumePosition | null>(null);
  const [clock, setClock] = useState(() => Date.now());
  const [isSavingAdhkar, setIsSavingAdhkar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  // Brouillon des jours de règles pendant la modification (null = lecture).
  const [periodDraft, setPeriodDraft] = useState<Set<string> | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [isSavingCycleDay, setIsSavingCycleDay] = useState(false);
  const [personalNoteDraft, setPersonalNoteDraft] = useState("");
  const [personalNoteTitle, setPersonalNoteTitle] = useState("");
  const [personalNoteUrgent, setPersonalNoteUrgent] = useState(false);
  const [personalNoteColor, setPersonalNoteColor] =
    useState<StickyNoteColor>("yellow");
  const [personalNoteIsTask, setPersonalNoteIsTask] = useState(false);
  const [personalNoteDraftOwner, setPersonalNoteDraftOwner] = useState<
    string | null
  >(null);
  const [editingPersonalNote, setEditingPersonalNote] =
    useState<Id<"personalNotes"> | null>(null);
  const [editNoteTitle, setEditNoteTitle] = useState("");
  const [editNoteContent, setEditNoteContent] = useState("");
  const [editNoteUrgent, setEditNoteUrgent] = useState(false);
  const [editNoteColor, setEditNoteColor] = useState<StickyNoteColor>("yellow");
  const [draggedNoteId, setDraggedNoteId] =
    useState<Id<"personalNotes"> | null>(null);
  const [isSavingPersonalNote, setIsSavingPersonalNote] = useState(false);
  const [notesSection, setNotesSection] = useState<
    "active" | "todo" | "done" | "archived"
  >("active");
  const [pendingNoteAction, setPendingNoteAction] = useState<string | null>(
    null,
  );
  const [isSavingLateAlerts, setIsSavingLateAlerts] = useState(false);
  const [qadaRamadanTotal, setQadaRamadanTotal] = useState("0");
  const [qadaRamadanCompleted, setQadaRamadanCompleted] = useState("0");
  const [isSavingQadaRamadan, setIsSavingQadaRamadan] = useState(false);
  const [reminders, setReminders] = useState<ReminderPreferences>(() =>
    readStored("nour-reminders", defaultReminders),
  );
  const firedToday = useRef<Record<string, string>>({});
  const notifiedLateCycle = useRef<string | null>(null);
  const firstName = user?.name?.trim().split(" ")[0];
  const today = todayKey();
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
  const scienceBooks = useQuery(api.scienceBooks.list, {});
  const [scienceTab, setScienceTab] = useState<"sessions" | "books" | "learning">("sessions");
  const adhkarProgress = useQuery(api.adhkarProgress.forDate, { date: today });
  const quranEntries = useQuery(api.quranProgress.list, {});
  const saveCycleDay = useMutation(api.cycleTracking.saveDay);
  const setPeriodDays = useMutation(api.cycleTracking.setPeriodDays);
  const setLateAlertsEnabled = useMutation(
    api.cycleTracking.setLateAlertsEnabled,
  );
  const setQadaRamadanProgress = useMutation(
    api.cycleTracking.setQadaRamadanProgress,
  );
  const addPersonalNote = useMutation(api.personalNotes.add);
  const editPersonalNote = useMutation(api.personalNotes.update);
  const reorderPersonalNotes = useMutation(api.personalNotes.reorder);
  const markPersonalNotesRead = useMutation(api.personalNotes.markAllRead);
  const setPersonalNoteArchived = useMutation(api.personalNotes.setArchived);
  const setPersonalTaskCompleted = useMutation(
    api.personalNotes.setTaskCompleted,
  );
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
  const latestQuranEntry = quranEntries?.[0];
  const quranResumeTarget =
    quranResumePosition ??
    (latestQuranEntry ? resumePositionFromReadingLog(latestQuranEntry) : null);
  const currentMinutes =
    new Date(clock).getHours() * 60 + new Date(clock).getMinutes();
  const asrMinutes = prayer.times
    ? prayer.times.asr
        .split(":")
        .map(Number)
        .reduce((hours, minutes) => hours * 60 + minutes, 0)
    : 16 * 60;
  const momentAdhkarSession: AdhkarSession =
    currentMinutes >= asrMinutes ? "evening" : "morning";
  const momentProgress = adhkarProgress?.find(
    (entry) => entry.session === momentAdhkarSession,
  );
  const momentIndex = momentProgress?.currentIndex ?? 0;
  const momentInvocation = adhkarBySession[momentAdhkarSession][momentIndex];
  const currentRepetitionCount = sessionProgress?.repetitionCount ?? 0;
  const isInvocationComplete =
    currentInvocation !== undefined &&
    currentRepetitionCount >= currentInvocation.repetitions;
  const records = cycleDays ?? [];
  const selectedDayKey = format(selectedDate, "yyyy-MM-dd");
  const clockDate = new Date(clock);
  const clockMinutes = clockDate.getHours() * 60 + clockDate.getMinutes();
  const nextPrayerName = prayer.times
    ? ((
        [
          ["Fajr", prayer.times.fajr],
          ["Dhuhr", prayer.times.dhuhr],
          ["Asr", prayer.times.asr],
          ["Maghrib", prayer.times.maghrib],
          ["Isha", prayer.times.isha],
        ] as const
      ).find(([, time]) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes > clockMinutes;
      })?.[0] ?? null)
    : null;
  const sortedScienceBooks = [...(scienceBooks ?? [])].sort((a, b) => a.position - b.position);
  const scienceBookToResume = (() => {
    const book =
      sortedScienceBooks.find((item) => item.status === "in-progress") ??
      sortedScienceBooks.find((item) => item.status === "to-read");
    return book && book.status !== "read"
      ? { title: book.title, author: book.author, status: book.status }
      : null;
  })();
  const recentNotes = (personalNotes ?? [])
    .filter((note) => note.archived !== true && note.isTask !== true)
    .sort((a, b) => Number(b.urgent === true) - Number(a.urgent === true))
    .slice(0, 3);
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
        : note.archived !== true &&
          (notesSection === "todo"
            ? note.isTask === true && note.completed !== true
            : notesSection === "done"
              ? note.isTask === true && note.completed === true
              : true),
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
    if (!user?._id) {
      setPersonalNoteDraftOwner(null);
      return;
    }

    const draft = readPersonalNoteDraft(user._id);
    setPersonalNoteTitle(draft.title);
    setPersonalNoteDraft(draft.content);
    setPersonalNoteUrgent(draft.urgent);
    setPersonalNoteColor(draft.color);
    setPersonalNoteIsTask(draft.isTask);
    setPersonalNoteDraftOwner(user._id);
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id || personalNoteDraftOwner !== user._id) return;

    const key = personalNoteDraftKey(user._id);
    const isEmpty =
      !personalNoteTitle &&
      !personalNoteDraft &&
      !personalNoteUrgent &&
      personalNoteColor === "yellow" &&
      !personalNoteIsTask;
    if (isEmpty) {
      localStorage.removeItem(key);
      return;
    }

    const draft: PersonalNoteDraft = {
      title: personalNoteTitle,
      content: personalNoteDraft,
      urgent: personalNoteUrgent,
      color: personalNoteColor,
      isTask: personalNoteIsTask,
    };
    localStorage.setItem(key, JSON.stringify(draft));
  }, [
    personalNoteColor,
    personalNoteDraft,
    personalNoteDraftOwner,
    personalNoteIsTask,
    personalNoteTitle,
    personalNoteUrgent,
    user?._id,
  ]);

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
    if (!cycleSettings) return;
    setQadaRamadanTotal(String(cycleSettings.qadaRamadanTotal ?? 0));
    setQadaRamadanCompleted(String(cycleSettings.qadaRamadanCompleted ?? 0));
  }, [
    cycleSettings?.qadaRamadanCompleted,
    cycleSettings?.qadaRamadanTotal,
  ]);

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
          title: "Adhkar du matin",
        },
        {
          key: "evening",
          enabled: reminders.evening,
          at: reminders.eveningTime,
          title: "Adhkar du soir",
        },
      ];
      moments.forEach(({ key, enabled, at, title }) => {
        if (enabled && time === at && firedToday.current[key] !== date) {
          firedToday.current[key] = date;
          new Notification(title, {
            body: "Ouvre Rawdah pour réciter les adhkar.",
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
          "Autorise les notifications dans ton navigateur pour activer ce rappel.",
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
      toast.error("Impossible d’enregistrer cette journée. Réessaie.");
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

  const recordedPeriodKeys = () =>
    new Set(records.filter((entry) => entry.isPeriodDay).map((entry) => entry.date));

  const startPeriodEdit = () => setPeriodDraft(recordedPeriodKeys());

  const savePeriodEdit = async () => {
    if (!periodDraft) return;
    const original = recordedPeriodKeys();
    const add = [...periodDraft].filter((date) => !original.has(date));
    const remove = [...original].filter((date) => !periodDraft.has(date));
    if (add.length === 0 && remove.length === 0) {
      setPeriodDraft(null);
      return;
    }
    setIsSavingCycleDay(true);
    try {
      await setPeriodDays({ add, remove });
      setPeriodDraft(null);
      toast.success("Tes règles ont été mises à jour.");
    } catch {
      toast.error("Impossible d’enregistrer tes règles. Réessaie.");
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
      toast.error("Impossible d’enregistrer ta préférence de notification.");
    } finally {
      setIsSavingLateAlerts(false);
    }
  };

  const saveQadaRamadan = async () => {
    setIsSavingQadaRamadan(true);
    try {
      await setQadaRamadanProgress({
        total: Number(qadaRamadanTotal),
        completed: Number(qadaRamadanCompleted),
      });
      toast.success("Suivi mis à jour.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Impossible d’enregistrer ce suivi.",
      );
    } finally {
      setIsSavingQadaRamadan(false);
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
      toast.error("Impossible d’enregistrer cette récitation. Réessaie.");
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
      toast.error("Récite toutes les répétitions avant de passer à la suite.");
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
    new Notification("Rappel de suivi", {
        body: "Un rappel de suivi est disponible dans Rawdah.",
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
    setScienceTab("sessions");
    if (view === "notes" && hasUnreadNotes && !isAnonymousUser) {
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
    navigateToView("adhkar");
  };

  useEffect(() => {
    const interval = window.setInterval(() => setClock(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateQuranResumePosition = (event: Event) => {
      setQuranResumePosition(
        (event as CustomEvent<QuranResumePosition>).detail,
      );
    };
    window.addEventListener(quranResumeEvent, updateQuranResumePosition);
    return () =>
      window.removeEventListener(quranResumeEvent, updateQuranResumePosition);
  }, []);

  const savePersonalNote = async () => {
    if (isAnonymousUser) {
      toast.error(
        "Connecte-toi avec ton email ou Google pour enregistrer tes notes. Les sessions anonymes ne permettent pas de sauvegarder les données.",
      );
      return;
    }
    setIsSavingPersonalNote(true);
    try {
      await addPersonalNote({
        content: personalNoteDraft,
        title: personalNoteTitle || undefined,
        urgent: personalNoteUrgent,
        color: personalNoteColor,
        isTask: personalNoteIsTask,
      });
      setPersonalNoteDraft("");
      setPersonalNoteTitle("");
      setPersonalNoteUrgent(false);
      setPersonalNoteColor("yellow");
      setPersonalNoteIsTask(false);
      // Nettoyer le localStorage après sauvegarde réussie
      if (user?._id) {
        localStorage.removeItem(personalNoteDraftKey(user._id));
      }
      toast.success("Note enregistrée.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer la note. Réessaie.",
      );
    } finally {
      setIsSavingPersonalNote(false);
    }
  };

  const savePersonalNoteEdits = async (noteId: Id<"personalNotes">) => {
    if (isAnonymousUser) {
      toast.error(
        "Connecte-toi avec ton email ou Google pour modifier tes notes.",
      );
      return;
    }
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
    if (isAnonymousUser) {
      toast.error("Connecte-toi pour réorganiser tes notes.");
      return;
    }
    if (!draggedNoteId || draggedNoteId === targetNoteId) return;
    const archived = notesSection === "archived";
    if (notesSection === "todo" || notesSection === "done") return;
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
    if (isAnonymousUser) {
      toast.error("Connecte-toi pour archiver/restaurer tes notes.");
      return;
    }
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

  const updatePersonalTaskCompletion = async (
    noteId: Id<"personalNotes">,
    completed: boolean,
  ) => {
    if (isAnonymousUser) {
      toast.error("Connecte-toi pour mettre à jour tes tâches.");
      return;
    }
    setPendingNoteAction(noteId);
    try {
      await setPersonalTaskCompleted({ noteId, completed });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de mettre à jour cette tâche.",
      );
    } finally {
      setPendingNoteAction(null);
    }
  };

  const deletePersonalNote = async (noteId: Id<"personalNotes">) => {
    if (isAnonymousUser) {
      toast.error("Connecte-toi pour supprimer tes notes.");
      return;
    }
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
      className={`dashboard-shell min-h-screen bg-background text-stone-900 ${isDarkMode ? "dark-dashboard" : ""}`}
    >
      <DashboardSidebar
        activeView={activeView}
        hasUnreadNotes={hasUnreadNotes}
        isExcusePeriod={isExcusePeriod}
        isCollapsed={isSidebarCollapsed}
        isDarkMode={isDarkMode}
        onNavigate={navigateToView}
        onExcusePeriodChange={setIsExcusePeriod}
        onCollapse={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        onDarkModeChange={setIsDarkMode}
        onSignOut={() => void handleSignOut()}
        isMenuOpen={isMobileMenuOpen}
        onMenuOpenChange={setIsMobileMenuOpen}
      />
      <div
        className={`min-h-screen bg-background transition-[padding] duration-300 ease-in-out ${isSidebarCollapsed ? "lg:pl-18" : "lg:pl-65"}`}
      >
        <header className={`n-topbar ${activeView === "overview" ? "n-topbar-plain" : ""}`}>
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 xl:px-8">
            {/* Mobile : menu à gauche, logo au centre, cloche et profil à droite.
                Sur ordinateur, menu et logo sont dans la barre latérale. */}
            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                aria-expanded={isMobileMenuOpen}
                aria-label="Ouvrir le menu"
                className="n-top-btn justify-self-start"
              >
                <Menu className="size-4.5" strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => navigateToView("overview")}
                className="flex items-center gap-2"
                aria-label="Rawdah, aujourd’hui"
              >
                <NourMark className="size-7 text-(--n-sage)" />
                <span className="n-display text-[19px]">Rawdah</span>
              </button>
              <div className="justify-self-end">
                <TopActions
                  firstName={firstName || ""}
                  email={user?.email}
                  isDarkMode={isDarkMode}
                  onDarkModeChange={setIsDarkMode}
                  onSignOut={() => void handleSignOut()}
                />
              </div>
            </div>
            {activeView !== "overview" && (
            <>
            <p className="text-[14px]">
              <span className="font-semibold">
                {(() => {
                  const label = new Intl.DateTimeFormat("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  }).format(clock);
                  return label.charAt(0).toUpperCase() + label.slice(1);
                })()}
              </span>
              <span className="text-(--n-muted)">
                {" · "}
                {new Intl.DateTimeFormat("fr-FR-u-ca-islamic", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(clock)}
              </span>
            </p>
            {prayer.times ? (
              <ul className="n-topbar-times" aria-label="Horaires de prière du jour">
                {(
                  [
                    ["Fajr", prayer.times.fajr],
                    ["Dhuhr", prayer.times.dhuhr],
                    ["Asr", prayer.times.asr],
                    ["Maghrib", prayer.times.maghrib],
                    ["Isha", prayer.times.isha],
                  ] as const
                ).map(([name, time]) => (
                  <li key={name} data-next={nextPrayerName === name}>
                    <span>{name}</span>
                    <b>{time}</b>
                  </li>
                ))}
              </ul>
            ) : (
              <button
                type="button"
                onClick={() => navigateToView("settings")}
                className="n-link text-sm"
              >
                {prayer.isLoading ? "Chargement des horaires…" : "Afficher les horaires de prière"}
              </button>
            )}
            </>
            )}
            <div className="ml-auto hidden lg:block">
              <TopActions
                firstName={firstName || ""}
                email={user?.email}
                isDarkMode={isDarkMode}
                onDarkModeChange={setIsDarkMode}
                onSignOut={() => void handleSignOut()}
              />
            </div>
          </div>
        </header>

        <div
          className={`mx-auto min-h-[calc(100vh-100px)] bg-background px-4 pb-32 sm:px-6 lg:pb-12 xl:px-8 ${activeView === "overview" ? "max-w-295 pt-2" : "max-w-[1600px] pt-6"}`}
        >
          <div className="grid items-start gap-6 xl:gap-8 xl:grid-cols-1">
            <section className="min-w-0 space-y-4">
              {(activeView === "overview" ||
                activeView === "adhkar" ||
                activeView === "salah" ||
                activeView === "quran" ||
                activeView === "science") && (
                <>
                  {activeView === "overview" && (
                    <TodayView
                      firstName={firstName}
                      now={clock}
                      prayer={prayer}
                      adhkar={{
                        session: momentAdhkarSession,
                        invocation: momentInvocation,
                        index: momentIndex,
                        total: adhkarBySession[momentAdhkarSession].length,
                        repetitionCount: momentProgress?.repetitionCount ?? 0,
                        isLoading: adhkarProgress === undefined,
                      }}
                      quran={{
                        surah: quranResumeTarget?.surah ?? latestQuranEntry?.passage,
                        detail: quranResumeTarget
                          ? `Verset ${quranResumeTarget.ayah}`
                          : latestQuranEntry?.pagesOrVerses,
                      }}
                      cycle={{
                        currentPeriodDay,
                        expectedNextPeriod,
                        periodDates: recordedPeriodDates,
                      }}
                      notes={recentNotes.map((note) => ({
                        id: note._id,
                        title: note.title,
                        content: note.content,
                        urgent: note.urgent === true,
                        cardClass:
                          stickyNoteColors.find(
                            (color) => color.value === (note.color ?? "yellow"),
                          )?.card ?? "note-color-yellow",
                      }))}
                      onOpenAdhkar={openAdhkarSession}
                      onOpenQuran={() => {
                        setQuranResumeRequest(quranResumeTarget);
                        navigateToView("quran");
                      }}
                      scienceBook={scienceBookToResume}
                      onOpenScienceBooks={() => {
                        navigateToView("science");
                        setScienceTab("books");
                      }}
                      onOpenCycle={() => navigateToView("periods")}
                      onOpenNotes={() => navigateToView("notes")}
                      onOpenSettings={() => navigateToView("settings")}
                    />
                  )}

                  {activeView === "salah" && (
                    <DailyPlanner
                      isExcusePeriod={isExcusePeriod}
                      prayerTimes={prayer.times}
                    />
                  )}


                  {activeView === "science" && <ScienceJournal initialTab={scienceTab} />}

                  {activeView === "adhkar" && (
                    <div id="dashboard-routine" className="scroll-mt-24 space-y-5">
                      <div className="n-page-head px-1">
                        <div>
                          <span className="n-label">Matin et soir</span>
                          <h1 className="n-page-title">Adhkar</h1>
                        </div>
                        <div className="n-seg" role="group" aria-label="Moment des invocations">
                          {(
                            [
                              { id: "morning", label: "Matin" },
                              { id: "evening", label: "Soir" },
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
                              >
                                {label}{" "}
                                <span className="font-normal opacity-70">
                                  {completed}/{adhkarBySession[id].length}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div
                        className="n-steps"
                        role="progressbar"
                        aria-label="Avancement de la routine"
                        aria-valuemin={0}
                        aria-valuemax={adhkarSequence.length}
                        aria-valuenow={Math.min(
                          sessionProgress?.currentIndex ?? 0,
                          adhkarSequence.length,
                        )}
                      >
                        {adhkarSequence.map((_, index) => (
                          <span
                            key={index}
                            data-state={
                              index < (sessionProgress?.currentIndex ?? 0)
                                ? "done"
                                : index === (sessionProgress?.currentIndex ?? 0)
                                  ? "current"
                                  : "todo"
                            }
                          />
                        ))}
                      </div>

                      <article className="n-card n-rise p-5! sm:p-8!">
                        {adhkarProgress === undefined ? (
                          <p className="py-10 text-center text-[15px] text-(--n-muted)" role="status">
                            Chargement de ta routine…
                          </p>
                        ) : currentInvocation ? (
                          <>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <span className="n-label">
                                Invocation {(sessionProgress?.currentIndex ?? 0) + 1} sur{" "}
                                {adhkarSequence.length}
                              </span>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  className="n-toggle"
                                  aria-pressed={showAdhkarTransliteration}
                                  onClick={() =>
                                    setShowAdhkarTransliteration((value) => !value)
                                  }
                                >
                                  Phonétique
                                </button>
                                <button
                                  type="button"
                                  className="n-toggle"
                                  aria-pressed={showAdhkarTranslation}
                                  onClick={() =>
                                    setShowAdhkarTranslation((value) => !value)
                                  }
                                >
                                  Traduction
                                </button>
                              </div>
                            </div>

                            <h2 className="n-display mt-6 text-[22px] leading-snug">
                              {currentInvocation.title}
                            </h2>
                            <p
                              className="n-arabic mt-4 text-[26px] leading-[2.2] sm:text-[32px]"
                              lang="ar"
                            >
                              {currentInvocation.arabic}
                            </p>
                            {showAdhkarTransliteration && (
                              <p className="mt-4 text-[15px] italic text-(--n-sage)">
                                {currentInvocation.transliteration}
                              </p>
                            )}
                            {showAdhkarTranslation && (
                              <p className="mt-3 text-[16px] leading-relaxed">
                                {currentInvocation.meaning}
                              </p>
                            )}

                            <div className="mt-8 flex flex-col items-center gap-4">
                              <button
                                type="button"
                                className="n-counter"
                                data-complete={isInvocationComplete}
                                disabled={
                                  isSavingAdhkar ||
                                  adhkarProgress === undefined ||
                                  isInvocationComplete
                                }
                                onClick={() => void recordCurrentAdhkarRepetition()}
                                aria-label={
                                  isInvocationComplete
                                    ? "Invocation terminée"
                                    : `J’ai récité, ${currentRepetitionCount} sur ${currentInvocation.repetitions}`
                                }
                              >
                                <svg viewBox="0 0 120 120" aria-hidden="true">
                                  <circle cx="60" cy="60" r="54" className="n-counter-track" />
                                  <circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    className="n-counter-fill"
                                    style={{
                                      strokeDashoffset:
                                        339.3 *
                                        (1 -
                                          Math.min(
                                            currentRepetitionCount /
                                              currentInvocation.repetitions,
                                            1,
                                          )),
                                    }}
                                  />
                                </svg>
                                <span className="relative">
                                  <b>{currentRepetitionCount}</b>
                                  <small>sur {currentInvocation.repetitions}</small>
                                </span>
                              </button>
                              <p className="text-center text-[14px] text-(--n-muted)">
                                {isInvocationComplete
                                  ? "Invocation terminée."
                                  : "Touche le cercle à chaque récitation."}
                              </p>
                              <button
                                type="button"
                                disabled={!isInvocationComplete || isSavingAdhkar}
                                onClick={() => void continueAdhkar()}
                                className="n-btn n-btn-sage px-6! disabled:opacity-40"
                              >
                                Invocation suivante
                              </button>
                            </div>

                            <details className="n-proof mt-8">
                              <summary>Preuve</summary>
                              <dl className="mt-3 space-y-3">
                                <div>
                                  <dt>Rapporteur</dt>
                                  <dd>{currentInvocation.proof.narrator}</dd>
                                </div>
                                <div>
                                  <dt>Sources</dt>
                                  {currentInvocation.proof.sources.map((source) => (
                                    <dd key={`${source.collection}-${source.number}`} className="mt-1">
                                      <span className="font-semibold">
                                        {source.collection}, n° {source.number}
                                      </span>
                                      <span className="block text-(--n-muted)">
                                        {source.grades
                                          .map(({ by, grade }) => `${grade} selon ${by}`)
                                          .join(" · ")}
                                      </span>
                                    </dd>
                                  ))}
                                </div>
                                {currentInvocation.proof.note && (
                                  <div>
                                    <dt>Note</dt>
                                    <dd>{currentInvocation.proof.note}</dd>
                                  </div>
                                )}
                                <div>
                                  <dt>Répétitions</dt>
                                  <dd>{currentInvocation.repetitions}</dd>
                                </div>
                              </dl>
                              <p className="mt-2 text-(--n-muted)">
                                Degrés : « sahih » = authentique, « hasan » = bon. Numérotation et classifications reprises de sunnah.com.
                              </p>
                            </details>
                          </>
                        ) : (
                          <div className="py-10 text-center">
                            <h2 className="n-display text-[24px]">Routine terminée</h2>
                            <p className="mt-2 text-[15px] text-(--n-muted)">
                              Tu as terminé les invocations{" "}
                              {adhkarSession === "morning" ? "du matin" : "du soir"}{" "}
                              aujourd’hui.
                            </p>
                          </div>
                        )}
                      </article>
                    </div>
                  )}
                </>
              )}

              {hasOpenedQuran && (
                <QuranJournal
                  resumePosition={quranResumeRequest}
                  isActive={activeView === "quran"}
                  onOpen={() => navigateToView("quran")}
                />
              )}

              {activeView === "periods" && (
                <div id="dashboard-status" className="scroll-mt-24 space-y-5">
                  <div className="n-page-head px-1">
                    <div>
                      <span className="n-label">Suivi privé</span>
                      <h1 className="n-page-title">Cycle</h1>
                    </div>
                    <span className="n-chip">Enregistré dans ton compte</span>
                  </div>

                  {isPeriodLate && expectedNextPeriod && (
                    <div className="n-card n-card-tint" role="status">
                      <p className="font-semibold">Ton cycle a peut-être un peu de retard</p>
                      <p className="mt-1 text-[15px] leading-6 text-(--n-muted)">
                        D’après les journées que tu as notées, la date estimée était le{" "}
                        {format(expectedNextPeriod, "d MMMM", { locale: fr })}. Les cycles
                        varient naturellement ; cette estimation n’est pas un avis médical.
                      </p>
                    </div>
                  )}

                  <div className="grid gap-4 lg:grid-cols-12">
                    <div className="flex flex-col lg:col-span-7">
                    <div className="n-card min-w-0 flex-1 p-3! sm:p-5!">
                      <CycleCalendar
                        month={calendarMonth}
                        onMonthChange={setCalendarMonth}
                        periodDates={
                          periodDraft ? [...periodDraft].map((date) => parseISO(date)) : periodDates
                        }
                        isEditing={periodDraft !== null}
                        selectedDate={selectedDate}
                        onDayClick={(day) => {
                          if (!periodDraft) {
                            setSelectedDate(day);
                            return;
                          }
                          const key = format(day, "yyyy-MM-dd");
                          setPeriodDraft((current) => {
                            const next = new Set(current);
                            if (next.has(key)) next.delete(key);
                            else next.add(key);
                            return next;
                          });
                        }}
                      />
                      {periodDraft ? (
                        <p className="mt-3 text-center text-[14px] text-(--n-muted)" role="status">
                          Coche ou décoche tes jours de règles, puis enregistre.
                        </p>
                      ) : (
                        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[13px] text-(--n-muted)">
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-block size-3 rounded-full bg-(--n-mauve-tint)" aria-hidden="true" />
                            Règles notées
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-block size-3 rounded-full border-2 border-(--n-sage)" aria-hidden="true" />
                            Jour choisi
                          </span>
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap justify-center gap-3">
                        {periodDraft ? (
                          <>
                            <button
                              type="button"
                              className="n-btn n-btn-ghost disabled:opacity-40"
                              disabled={isSavingCycleDay}
                              onClick={() => setPeriodDraft(null)}
                            >
                              Annuler
                            </button>
                            <button
                              type="button"
                              className="n-btn n-btn-sage disabled:opacity-40"
                              disabled={isSavingCycleDay}
                              onClick={() => void savePeriodEdit()}
                            >
                              {isSavingCycleDay ? "Enregistrement…" : "Enregistrer les nouvelles règles"}
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="n-btn n-btn-sage disabled:opacity-40"
                            disabled={cycleDays === undefined}
                            onClick={startPeriodEdit}
                          >
                            Modifier les règles
                          </button>
                        )}
                      </div>
                    </div>

                    </div>
                    <div className="n-stack lg:col-span-5">
                    <article className="n-card n-card-dark n-rise">
                      <span className="n-label">Prochaines règles estimées</span>
                      <p className="n-display mt-4 text-[34px] leading-none">
                        {expectedNextPeriod
                          ? format(expectedNextPeriod, "d MMMM", { locale: fr })
                          : "—"}
                      </p>
                      <p className="mt-3 text-[14px] text-(--n-on-dark-muted)">
                        {expectedNextPeriod
                          ? format(expectedNextPeriod, "EEEE yyyy", { locale: fr })
                          : "Note au moins 3 débuts de cycle pour obtenir une estimation."}
                      </p>
                    </article>
                    <div className="n-card n-rise grid grid-cols-2 gap-5">
                      {[
                        { label: "Jours notés", value: String(daysTrackedThisMonth), hint: "ce mois-ci" },
                        { label: "Débuts notés", value: String(periodStarts.length), hint: "au total" },
                        {
                          label: "Durée des règles",
                          value: averagePeriodLength ? String(averagePeriodLength) : "—",
                          hint: averagePeriodLength ? `jour${averagePeriodLength === 1 ? "" : "s"} en moyenne` : "à calculer",
                        },
                        {
                          label: "Durée du cycle",
                          value: averageCycleLength ? String(averageCycleLength) : "—",
                          hint: averageCycleLength ? "jours en moyenne" : "à calculer",
                        },
                      ].map((stat) => (
                        <div key={stat.label}>
                          <p className="text-[13px] font-semibold text-(--n-muted)">{stat.label}</p>
                          <p className="n-display mt-2 text-[30px] leading-none">{stat.value}</p>
                          <p className="mt-1 text-[13px] text-(--n-muted)">{stat.hint}</p>
                        </div>
                      ))}
                      <p className="col-span-full text-[13px] leading-5 text-(--n-muted)">
                        Estimations fondées sur les cycles enregistrés ; elles peuvent varier et
                        ne constituent pas un avis médical.
                      </p>
                    </div>
                    </div>
                    <div className="flex flex-col lg:col-span-7">
                    <div id="cycle-day-editor" className="n-card min-w-0 flex-1">
                      <span className="n-label">
                        {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
                      </span>
                      <h2 className="n-display mt-3 text-[22px]">Ce jour-là</h2>
                      <p className="mt-1 text-[15px] text-(--n-muted)">
                        Touche un jour du calendrier pour y noter tes observations ou une note.
                      </p>

                      <div className="mt-6 border-t border-(--n-line) pt-5">
                        <p className="text-[14px] font-semibold">
                          Observations du jour <span className="font-normal text-(--n-muted)">(facultatif)</span>
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {cycleSymptoms.map(({ key, label }) => {
                            const selected = selectedEntry?.symptoms.includes(key) ?? false;
                            return (
                              <button
                                key={key}
                                type="button"
                                disabled={cycleDays === undefined || isSavingCycleDay}
                                aria-pressed={selected}
                                onClick={() => toggleSymptom(key)}
                                className="n-toggle disabled:opacity-60"
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-6 border-t border-(--n-line) pt-5">
                        <label htmlFor="cycle-personal-note" className="text-[14px] font-semibold">
                          Note personnelle <span className="font-normal text-(--n-muted)">(facultatif)</span>
                        </label>
                        <textarea
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
                          placeholder="Ajoute ici une note que tu veux retrouver plus tard…"
                          className="n-input n-textarea mt-2"
                        />
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <p className="text-[13px] tabular-nums text-(--n-muted)">{noteDraft.length}/2 000</p>
                          <button
                            type="button"
                            onClick={() => void saveCycleNote()}
                            disabled={cycleDays === undefined || isSavingCycleDay}
                            className="n-btn px-4! py-2.5! text-sm! disabled:opacity-40"
                          >
                            Enregistrer la note
                          </button>
                        </div>
                        <p className="mt-3 min-h-5 text-[13px] text-(--n-muted)" aria-live="polite">
                          {cycleDays === undefined
                            ? "Chargement de ton calendrier…"
                            : isSavingCycleDay
                              ? "Enregistrement…"
                              : "La note est enregistrée pour la date sélectionnée."}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4 border-t border-(--n-line) pt-5">
                        <div>
                          <p className="text-[14px] font-semibold">Alerte si mes règles tardent</p>
                          <p className="mt-1 text-[13px] leading-5 text-(--n-muted)">
                            Estimation après trois cycles notés ; notification du navigateur
                            lorsque l’application est ouverte.
                          </p>
                        </div>
                        <Switch
                          checked={cycleSettings?.lateAlertsEnabled ?? false}
                          disabled={cycleSettings === undefined || isSavingLateAlerts}
                          onCheckedChange={(enabled) => void updateLateAlerts(enabled)}
                          aria-label="Activer les alertes de retard de règles"
                        />
                      </div>
                    </div>
                    </div>
                    <div className="n-stack lg:col-span-5">
                  <section className="n-card" aria-labelledby="qada-heading">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <span className="n-label">Ramadan</span>
                        <h2 id="qada-heading" className="n-display mt-3 text-[22px]">
                          Jours à rattraper (qada)
                        </h2>
                      </div>
                      <p className="text-right">
                        <span className="n-display block text-[34px] leading-none">
                          {Math.max(0, Number(qadaRamadanTotal) - Number(qadaRamadanCompleted))}
                        </span>
                        <span className="text-[13px] text-(--n-muted)">jours restants</span>
                      </p>
                    </div>
                    <div className="n-steps mt-5" aria-hidden="true">
                      <span
                        data-state="done"
                        style={{
                          flex: Math.min(Number(qadaRamadanCompleted) || 0, Number(qadaRamadanTotal) || 0),
                        }}
                      />
                      <span
                        style={{
                          flex: Math.max(0, (Number(qadaRamadanTotal) || 0) - (Number(qadaRamadanCompleted) || 0)),
                        }}
                      />
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                      <label className="grid gap-1 text-[13px] font-semibold">
                        Jours à rattraper
                        <input
                          type="number"
                          min="0"
                          max="10000"
                          step="1"
                          value={qadaRamadanTotal}
                          onChange={(event) => setQadaRamadanTotal(event.target.value)}
                          className="n-input"
                        />
                      </label>
                      <label className="grid gap-1 text-[13px] font-semibold">
                        Jours effectués
                        <input
                          type="number"
                          min="0"
                          max={qadaRamadanTotal || 0}
                          step="1"
                          value={qadaRamadanCompleted}
                          onChange={(event) => setQadaRamadanCompleted(event.target.value)}
                          className="n-input"
                        />
                      </label>
                      <button
                        type="button"
                        className="n-btn n-btn-sage disabled:opacity-40"
                        disabled={
                          cycleSettings === undefined ||
                          isSavingQadaRamadan ||
                          !Number.isInteger(Number(qadaRamadanTotal)) ||
                          !Number.isInteger(Number(qadaRamadanCompleted)) ||
                          Number(qadaRamadanCompleted) > Number(qadaRamadanTotal)
                        }
                        onClick={() => void saveQadaRamadan()}
                      >
                        {isSavingQadaRamadan ? "Enregistrement…" : "Enregistrer"}
                      </button>
                    </div>
                    <p className="mt-3 text-[13px] text-(--n-muted)">
                      Un simple compteur personnel. Pour les règles du rattrapage, réfère-toi à une
                      personne de science.
                    </p>
                  </section>
                    <section aria-labelledby="cycle-notes-heading" className="n-card min-w-0">
                      <h2 id="cycle-notes-heading" className="n-display text-[20px]">
                        Notes du cycle
                      </h2>
                      {cycleDays === undefined ? (
                        <p className="mt-4 text-[15px] text-(--n-muted)">Chargement des notes…</p>
                      ) : cycleNotes.length === 0 ? (
                        <p className="mt-3 text-[15px] text-(--n-muted)">
                          Aucune note pour le moment. Sélectionne une date, écris une note et
                          enregistre-la.
                        </p>
                      ) : (
                        <ul className="mt-3 divide-y divide-(--n-line)">
                          {cycleNotes.map((entry) => (
                            <li key={entry._id} className="flex items-start gap-2 py-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const date = parseISO(entry.date);
                                  setSelectedDate(date);
                                  setCalendarMonth(startOfMonth(date));
                                  requestAnimationFrame(() =>
                                    document
                                      .getElementById("cycle-day-editor")
                                      ?.scrollIntoView({ behavior: "smooth", block: "center" }),
                                  );
                                }}
                                className="min-w-0 flex-1 text-left"
                              >
                                <time dateTime={entry.date} className="text-[13px] font-semibold text-(--n-sage)">
                                  {format(parseISO(entry.date), "d MMMM yyyy", { locale: fr })}
                                </time>
                                <p className="mt-1 whitespace-pre-wrap text-[15px] leading-6">{entry.note}</p>
                              </button>
                              <button
                                type="button"
                                onClick={() => void deleteCycleNote(entry)}
                                disabled={isSavingCycleDay}
                                aria-label={`Supprimer la note du ${format(parseISO(entry.date), "d MMMM yyyy", { locale: fr })}`}
                                className="n-link shrink-0 text-[13px] text-(--n-muted)! disabled:opacity-50"
                              >
                                Supprimer
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>

                    <details className="n-card min-w-0">
                      <summary className="n-display cursor-pointer text-[20px]">
                        Symptômes notés <span className="text-[15px] font-normal text-(--n-muted)">(facultatif)</span>
                      </summary>
                      {cycleDays === undefined ? (
                        <p className="mt-4 text-[15px] text-(--n-muted)">Chargement des symptômes…</p>
                      ) : records.filter((entry) => entry.symptoms.length > 0).length === 0 ? (
                        <p className="mt-3 text-[15px] text-(--n-muted)">
                          Aucun symptôme noté. Sélectionne une date dans le calendrier et choisis
                          les observations du jour.
                        </p>
                      ) : (
                        <ul className="mt-3 divide-y divide-(--n-line)">
                          {[...records]
                            .filter((entry) => entry.symptoms.length > 0)
                            .sort((first, second) => second.date.localeCompare(first.date))
                            .map((entry) => (
                              <li key={entry._id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const date = parseISO(entry.date);
                                    setSelectedDate(date);
                                      setCalendarMonth(startOfMonth(date));
                                    requestAnimationFrame(() =>
                                      document
                                        .getElementById("cycle-day-editor")
                                        ?.scrollIntoView({ behavior: "smooth", block: "center" }),
                                    );
                                  }}
                                  className="w-full py-3 text-left"
                                >
                                  <time dateTime={entry.date} className="text-[13px] font-semibold text-(--n-sage)">
                                    {format(parseISO(entry.date), "d MMMM yyyy", { locale: fr })}
                                  </time>
                                  <span className="mt-2 flex flex-wrap gap-1.5">
                                    {entry.symptoms.map((symptom) => (
                                      <span key={symptom} className="n-chip">
                                        {cycleSymptoms.find((item) => item.key === symptom)?.label ?? symptom}
                                      </span>
                                    ))}
                                  </span>
                                </button>
                              </li>
                            ))}
                        </ul>
                      )}
                    </details>
                    </div>
                  </div>

                  {cycleDays?.length === 0 && (
                    <p className="text-center text-[13px] leading-5 text-(--n-muted)">
                      Ton calendrier est vide pour le moment. Sélectionne une date pour commencer ;
                      tu pourras modifier ou retirer tes entrées à tout moment.
                    </p>
                  )}
                </div>
              )}

              {activeView === "notes" && (
                <section id="dashboard-notes" className="scroll-mt-24 space-y-5">
                  <div className="n-page-head px-1">
                    <div>
                      <span className="n-label">Espace personnel</span>
                      <h1 className="n-page-title">Notes</h1>
                    </div>
                  </div>

                  {isAnonymousUser && (
                    <div className="n-card n-card-tint" role="status">
                      <p className="text-[15px] font-semibold">
                        Connecte-toi avec ton e-mail ou Google pour sauvegarder tes notes.
                      </p>
                      <p className="mt-1 text-[14px] text-(--n-muted)">
                        Les données d’une session anonyme sont perdues à la déconnexion.
                      </p>
                    </div>
                  )}

                  <form
                    className="n-card"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void savePersonalNote();
                    }}
                  >
                    <h2 className="n-display text-[20px]">Nouvelle note</h2>
                    <input
                      value={personalNoteTitle}
                      onChange={(event) => setPersonalNoteTitle(event.target.value)}
                      maxLength={100}
                      aria-label="Titre de la note"
                      placeholder="Titre (facultatif)"
                      className="n-input mt-4 font-semibold"
                    />
                    <textarea
                      id="personal-note"
                      value={personalNoteDraft}
                      onChange={(event) => setPersonalNoteDraft(event.target.value)}
                      maxLength={5000}
                      aria-label="Contenu de la note"
                      placeholder="Écris ton idée ou ton rappel…"
                      className="n-input n-textarea mt-3"
                    />
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="n-toggle"
                          aria-pressed={personalNoteIsTask}
                          onClick={() => setPersonalNoteIsTask((value) => !value)}
                        >
                          Ajouter à mes tâches
                        </button>
                        <button
                          type="button"
                          className="n-toggle"
                          aria-pressed={personalNoteUrgent}
                          onClick={() => setPersonalNoteUrgent((value) => !value)}
                        >
                          Importante
                        </button>
                      </div>
                      <fieldset>
                        <legend className="sr-only">Couleur du post-it</legend>
                        <div className="flex gap-2">
                          {stickyNoteColors.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => setPersonalNoteColor(color.value)}
                              aria-label={color.label}
                              aria-pressed={personalNoteColor === color.value}
                              className={`n-swatch ${color.swatch}`}
                            />
                          ))}
                        </div>
                      </fieldset>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="text-[13px] tabular-nums text-(--n-muted)">
                        {personalNoteDraft.length}/5 000
                      </span>
                      <button
                        type="submit"
                        disabled={
                          !personalNoteDraft.trim() ||
                          personalNoteDraft.length > 5000 ||
                          personalNoteTitle.length > 100 ||
                          isSavingPersonalNote
                        }
                        className="n-btn n-btn-sage disabled:opacity-40"
                      >
                        {isSavingPersonalNote
                          ? "Enregistrement…"
                          : personalNoteIsTask
                            ? "Ajouter à mes tâches"
                            : "Ajouter la note"}
                      </button>
                    </div>
                  </form>

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                      <h2 className="n-display text-[22px]">
                        {notesSection === "active"
                          ? "Mes notes"
                          : notesSection === "todo"
                            ? "À faire"
                            : notesSection === "done"
                              ? "Faites"
                              : "Notes archivées"}
                      </h2>
                      <div className="n-seg" role="group" aria-label="Filtrer les notes">
                        {(
                          [
                            { id: "active", label: "Notes" },
                            { id: "todo", label: "À faire" },
                            { id: "done", label: "Faites" },
                            { id: "archived", label: "Archivées" },
                          ] as const
                        ).map(({ id, label }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setNotesSection(id)}
                            aria-pressed={notesSection === id}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {visiblePersonalNotes === undefined ? (
                      <p className="mt-4 px-1 text-[15px] text-(--n-muted)">
                        Chargement de tes notes…
                      </p>
                    ) : visiblePersonalNotes.length === 0 ? (
                      <p className="n-dashed mt-4 text-center">
                        {notesSection === "archived"
                          ? "Aucune note archivée pour le moment."
                          : notesSection === "todo"
                            ? "Aucune tâche à faire."
                            : notesSection === "done"
                              ? "Aucune tâche terminée pour le moment."
                              : "Aucune note pour le moment. Ajoute ta première note juste au-dessus."}
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
                              draggable={
                                !isEditing &&
                                (notesSection === "active" ||
                                  notesSection === "archived")
                              }
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
                              className={`n-postit ${noteColor.card} ${draggedNoteId === note._id ? "scale-95 opacity-40" : ""} ${!isEditing && !note.archived ? "cursor-grab active:cursor-grabbing" : ""}`}
                            >
                              {isEditing ? (
                                <form
                                  className="relative z-10 space-y-3"
                                  onSubmit={(event) => {
                                    event.preventDefault();
                                    void savePersonalNoteEdits(note._id);
                                  }}
                                >
                                  <input
                                    value={editNoteTitle}
                                    onChange={(event) =>
                                      setEditNoteTitle(event.target.value)
                                    }
                                    maxLength={100}
                                    aria-label="Titre du post-it"
                                    className="n-input n-postit-field font-semibold"
                                  />
                                  <textarea
                                    value={editNoteContent}
                                    onChange={(event) =>
                                      setEditNoteContent(event.target.value)
                                    }
                                    maxLength={5000}
                                    aria-label="Contenu du post-it"
                                    className="n-input n-textarea n-postit-field"
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
                                          className={`n-swatch size-7! ${color.swatch}`}
                                        />
                                      ))}
                                    </div>
                                    <button
                                      type="button"
                                      className="n-toggle bg-white/60!"
                                      aria-pressed={editNoteUrgent}
                                      onClick={() => setEditNoteUrgent((value) => !value)}
                                    >
                                      Importante
                                    </button>
                                  </div>
                                  <div className="flex items-center justify-end gap-3">
                                    <button
                                      type="button"
                                      className="n-link text-sm text-(--n-muted)!"
                                      onClick={() =>
                                        setEditingPersonalNote(null)
                                      }
                                    >
                                      Annuler
                                    </button>
                                    <button
                                      type="submit"
                                      disabled={
                                        pendingNoteAction === note._id ||
                                        !editNoteTitle.trim() ||
                                        !editNoteContent.trim()
                                      }
                                      className="n-btn px-4! py-2.5! text-sm! disabled:opacity-40"
                                    >
                                      Enregistrer
                                    </button>
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
                                  <div className="relative z-10 mt-3 flex items-center justify-between gap-3">
                                    {note.isTask === true && (
                                      <label className="inline-flex items-center gap-2 text-sm text-stone-700">
                                        <input
                                          type="checkbox"
                                          checked={note.completed === true}
                                          disabled={pendingNoteAction === note._id}
                                          onChange={(event) =>
                                            void updatePersonalTaskCompletion(
                                              note._id,
                                              event.target.checked,
                                            )
                                          }
                                          aria-label={
                                            note.completed
                                              ? "Marquer comme à faire"
                                              : "Marquer comme terminée"
                                          }
                                          className="size-4 accent-[#5F7F68]"
                                        />
                                        Tâche
                                      </label>
                                    )}
                                    {note.urgent && (
                                      <span className="n-postit-tag ml-auto">Importante</span>
                                    )}
                                  </div>
                                  <h3 className="n-display relative z-10 mt-3 wrap-break-words text-[19px] leading-6">
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
                                        className="inline-flex size-8 items-center justify-center rounded-lg text-stone-700 hover:bg-mauve-100 hover:text-mauve-800 disabled:opacity-50"
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
              <section id="dashboard-settings" className="scroll-mt-24 space-y-5">
                <div className="n-page-head px-1">
                  <div>
                    <span className="n-label">Préférences</span>
                    <h1 className="n-page-title">Réglages</h1>
                  </div>
                </div>

                <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                  <article className="n-card">
                    <h2 className="n-display text-[22px]">Horaires de prière</h2>

                    {/* Lieu des horaires : bien visible, en tête de carte */}
                    <div className="n-place-current mt-4">
                      <MapPin className="size-5 shrink-0" strokeWidth={1.8} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-semibold uppercase tracking-[0.1em] text-(--n-muted)">
                          Ville des horaires
                        </span>
                        <span className="block truncate text-[17px] font-semibold">
                          {prayer.preferences.placeLabel ??
                            (prayer.preferences.coordinates ? "Ma position actuelle" : "Aucune ville choisie")}
                        </span>
                      </span>
                      {prayer.preferences.coordinates && (
                        <button
                          type="button"
                          onClick={prayer.clearLocation}
                          className="n-link shrink-0 text-sm text-(--n-muted)!"
                        >
                          Effacer
                        </button>
                      )}
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
                      <button
                        type="button"
                        onClick={prayer.requestLocation}
                        disabled={prayer.isLoading}
                        className={`n-btn ${prayer.preferences.coordinates && !prayer.preferences.placeLabel ? "n-btn-ghost" : "n-btn-sage"} mt-0 px-4! py-3! text-sm! disabled:opacity-50 sm:mt-6`}
                      >
                        <LocateFixed className="size-4" />
                        {prayer.isLoading ? "Recherche…" : "Utiliser ma position"}
                      </button>
                      <PlaceSearch
                        coordinates={prayer.preferences.coordinates}
                        onSetPlace={prayer.setPlace}
                      />
                    </div>

                    {prayer.error && (
                      <p role="alert" className="mt-4 text-[14px] text-[#b4473a]">
                        {prayer.error}
                      </p>
                    )}

                    {prayer.times && (
                      <ul className="n-times mt-5" aria-label="Horaires du jour">
                        {(
                          [
                            ["Fajr", prayer.times.fajr],
                            ["Dhuhr", prayer.times.dhuhr],
                            ["Asr", prayer.times.asr],
                            ["Maghrib", prayer.times.maghrib],
                            ["Isha", prayer.times.isha],
                          ] as const
                        ).map(([name, time]) => (
                          <li key={name}>
                            <span>{name}</span>
                            <b>{time}</b>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-5 border-t border-(--n-line) pt-5">
                      <p className="text-[14px] font-semibold">
                        Méthode : {prayerCalculation.label}
                      </p>
                      <p className="mt-1 text-[14px] leading-6 text-(--n-muted)">
                        Fajr quand le soleil est à {prayerCalculation.fajrAngle}° sous
                        l’horizon, Isha à {prayerCalculation.ishaAngle}°, Maghrib{" "}
                        {prayerCalculation.maghribOffsetMinutes} minutes après le coucher du
                        soleil. La même méthode s’applique à tout le monde dans Rawdah.
                      </p>
                      <details className="n-proof mt-3 border-t-0! pt-0!">
                        <summary>Écart avec ta mosquée</summary>
                        <div className="mt-2 space-y-2 text-(--n-muted)">
                          <p>
                            Chaque mosquée choisit ses propres angles et ajoute parfois quelques
                            minutes de précaution. Si ta mosquée utilise d’autres réglages, un
                            écart de quelques minutes est possible : en cas de doute, suis ta
                            mosquée.
                          </p>
                          <p>
                            Aux latitudes élevées, quand le soleil ne descend pas assez sous
                            l’horizon, le calcul applique une règle d’ajustement.
                          </p>
                        </div>
                      </details>
                    </div>

                    <label className="mt-5 grid gap-1 text-[13px] font-semibold">
                      Calcul de l’heure d’Asr
                      <select
                        value={prayer.preferences.school}
                        onChange={(event) =>
                          prayer.setSchool(event.target.value === "1" ? 1 : 0)
                        }
                        className="n-select w-full"
                      >
                        <option value={0}>Standard (Shafi‘i, Maliki, Hanbali)</option>
                        <option value={1}>Hanafi</option>
                      </select>
                    </label>

                    <p className="mt-5 text-[13px] leading-5 text-(--n-muted)">
                      Ta position ou ta ville reste sur cet appareil, pas dans ton compte Rawdah.
                      Elle est envoyée à{" "}
                      <a
                        href="https://aladhan.com/prayer-times-api"
                        target="_blank"
                        rel="noreferrer"
                        className="n-link font-normal"
                      >
                        AlAdhan
                      </a>{" "}
                      pour calculer les horaires. Le nom tapé dans la recherche est envoyé à
                      Open-Meteo. Pour les mosquées proches, la position est envoyée à Photon
                      (OpenStreetMap).
                    </p>
                  </article>

                  <article id="dashboard-reminders" className="n-card scroll-mt-24">
                    <h2 className="n-display text-[22px]">Rappels</h2>
                    <p className="mt-1 text-[14px] text-(--n-muted)">
                      Discrets, sans détail personnel.
                    </p>
                    <div className="mt-5 divide-y divide-(--n-line)">
                      <ReminderRow
                        label="Adhkar du matin"
                        time={reminders.morningTime}
                        enabled={reminders.morning}
                        onTimeChange={(value) =>
                          setReminders((current) => ({ ...current, morningTime: value }))
                        }
                        onToggle={(value) => void updateReminder("morning", value)}
                      />
                      <ReminderRow
                        label="Adhkar du soir"
                        time={reminders.eveningTime}
                        enabled={reminders.evening}
                        onTimeChange={(value) =>
                          setReminders((current) => ({ ...current, eveningTime: value }))
                        }
                        onToggle={(value) => void updateReminder("evening", value)}
                      />
                    </div>
                    <p className="mt-4 text-[13px] leading-5 text-(--n-muted)">
                      Les rappels fonctionnent lorsque Rawdah est ouverte. Sur iPhone, les
                      notifications écran verrouillé demandent l’installation sur l’écran
                      d’accueil et un service Web Push, qui n’est pas encore configuré.
                    </p>
                  </article>
                </div>
              </section>
            )}
          </div>

          <footer className="mt-10 flex flex-col gap-2 border-t border-(--n-line) pt-5 text-[13px] text-(--n-muted) sm:flex-row sm:items-center sm:justify-between">
            <span>Rawdah · Suivi quotidien personnel</span>
            <span>
              Ton calendrier est enregistré sur ton compte ; tes préférences de
              rappel sont enregistrées sur cet appareil.
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
    <div className="flex items-center gap-3 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold">{label}</p>
        <input
          type="time"
          value={time}
          onChange={(event) => onTimeChange(event.target.value)}
          className="n-input mt-2 h-10! w-32 tabular-nums"
          aria-label={`Heure du rappel ${label}`}
        />
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        aria-label={`Activer le rappel ${label}`}
      />
    </div>
  );
}
