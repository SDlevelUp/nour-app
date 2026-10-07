import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { adhkarBySession, type AdhkarSession } from "@/convex/adhkarData";
import type { PrayerTimes } from "@/hooks/use-prayer-times";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CalendarClock,
  Clock3,
  GraduationCap,
  MoonStar,
  Plus,
  Settings2,
  Sun,
  X,
} from "lucide-react";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import type { DashboardView } from "./dashboardNavigation";

type WidgetId =
  | "next-prayer"
  | "morning-adhkar"
  | "evening-adhkar"
  | "quran"
  | "science"
  | "planner";

type WidgetDefinition = {
  id: WidgetId;
  label: string;
};

const widgets: WidgetDefinition[] = [
  { id: "next-prayer", label: "Prochaine prière" },
  { id: "morning-adhkar", label: "Adhkar du matin" },
  { id: "evening-adhkar", label: "Adhkar du soir" },
  { id: "quran", label: "Reprise Al-Qur’an" },
  { id: "science", label: "Dernière étude" },
  { id: "planner", label: "Accès au planning" },
];

const defaultWidgetIds: WidgetId[] = [
  "next-prayer",
  "morning-adhkar",
  "quran",
  "science",
];
const storageKey = "nour-dashboard-widgets";

function readWidgetIds(): WidgetId[] {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return defaultWidgetIds;
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return defaultWidgetIds;
    const validIds = parsed.filter(
      (id): id is WidgetId =>
        typeof id === "string" && widgets.some((widget) => widget.id === id),
    );
    return [...new Set(validIds)].slice(0, 6);
  } catch {
    return defaultWidgetIds;
  }
}

function getNextPrayer(times: PrayerTimes | null) {
  if (!times) return "Configure tes horaires dans les réglages.";
  const prayers = [
    ["Fajr", times.fajr],
    ["Dhuhr", times.dhuhr],
    ["Asr", times.asr],
    ["Maghrib", times.maghrib],
    ["Isha", times.isha],
  ] as const;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const next = prayers.find((prayer) => {
    const time = prayer[1];
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes > nowMinutes;
  });
  return next ? `${next[0]} · ${next[1]}` : "Fajr demain · horaire à venir";
}

type DashboardWidgetsProps = {
  prayerTimes: PrayerTimes | null;
  adhkarProgress:
    | { session: AdhkarSession; currentIndex: number }[]
    | undefined;
  onNavigate: (view: DashboardView) => void;
};

export function DashboardWidgets({
  prayerTimes,
  adhkarProgress,
  onNavigate,
}: DashboardWidgetsProps) {
  const quranEntries = useQuery(api.quranProgress.list, {});
  const scienceEntries = useQuery(api.scienceProgress.list, {});
  const [selectedIds, setSelectedIds] = useState<WidgetId[]>(readWidgetIds);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [widgetToAdd, setWidgetToAdd] = useState<WidgetId | "">("");
  const [, setClock] = useState(0);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(selectedIds));
  }, [selectedIds]);

  useEffect(() => {
    const interval = window.setInterval(() => setClock(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const moveWidget = (index: number, direction: -1 | 1) => {
    setSelectedIds((current) => {
      const destination = index + direction;
      if (destination < 0 || destination >= current.length) return current;
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  };

  const removeWidget = (id: WidgetId) => {
    setSelectedIds((current) => current.filter((item) => item !== id));
  };

  const addWidget = () => {
    if (!widgetToAdd || selectedIds.length >= 6) return;
    setSelectedIds((current) =>
      current.includes(widgetToAdd) ? current : [...current, widgetToAdd],
    );
    setWidgetToAdd("");
  };

  const latestQuran = quranEntries?.[0];
  const latestScience = scienceEntries?.[0];
  const completedMorning =
    adhkarProgress?.find((entry) => entry.session === "morning")
      ?.currentIndex ?? 0;
  const completedEvening =
    adhkarProgress?.find((entry) => entry.session === "evening")
      ?.currentIndex ?? 0;

  const content: Record<
    WidgetId,
    { icon: typeof Clock3; title: string; detail: string; view: DashboardView }
  > = {
    "next-prayer": {
      icon: Clock3,
      title: "Prochaine prière",
      detail: getNextPrayer(prayerTimes),
      view: "salah",
    },
    "morning-adhkar": {
      icon: Sun,
      title: "Adhkar du matin",
      detail: `${completedMorning} / ${adhkarBySession.morning.length} invocations parcourues`,
      view: "overview",
    },
    "evening-adhkar": {
      icon: MoonStar,
      title: "Adhkar du soir",
      detail: `${completedEvening} / ${adhkarBySession.evening.length} invocations parcourues`,
      view: "overview",
    },
    quran: {
      icon: BookOpen,
      title: "Reprise Al-Qur’an",
      detail: latestQuran
        ? `${latestQuran.passage}${latestQuran.pagesOrVerses ? ` · ${latestQuran.pagesOrVerses}` : ""}`
        : "Ajoute ta première lecture.",
      view: "quran",
    },
    science: {
      icon: GraduationCap,
      title: "Dernière étude",
      detail: latestScience
        ? `${latestScience.title} · ${latestScience.lesson}`
        : "Ajoute ton premier cours ou livre.",
      view: "science",
    },
    planner: {
      icon: CalendarClock,
      title: "Planning du jour",
      detail: "Voir et organiser ta semaine.",
      view: "salah",
    },
  };

  return (
    <section aria-label="Blocs personnalisables" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Mes raccourcis
          </p>
          <h2 className="mt-1 font-serif text-xl tracking-tight">
            Pour aujourd’hui
          </h2>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsCustomizing((open) => !open)}
          aria-expanded={isCustomizing}
          className="gap-1.5 text-xs"
        >
          <Settings2 className="size-3.5" />
          {isCustomizing ? "Terminer" : "Modifier"}
        </Button>
      </div>

      {isCustomizing && (
        <div className="rounded-2xl border border-stone-200 bg-[#F5F2EE] p-3">
          <p className="text-xs leading-5 text-stone-600">
            Choisis jusqu’à 6 blocs et organise leur ordre.
          </p>
          {selectedIds.length > 0 && (
            <ul className="mt-2 space-y-1">
              {selectedIds.map((id, index) => (
                <li
                  key={id}
                  className="flex items-center gap-1 rounded-lg bg-white px-2 py-1.5"
                >
                  <span className="min-w-0 flex-1 truncate text-xs text-stone-700">
                    {widgets.find((widget) => widget.id === id)?.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveWidget(index, -1)}
                    disabled={index === 0}
                    aria-label={`Monter ${widgets.find((widget) => widget.id === id)?.label}`}
                    className="rounded p-1 text-stone-500 hover:bg-stone-100 disabled:opacity-30"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveWidget(index, 1)}
                    disabled={index === selectedIds.length - 1}
                    aria-label={`Descendre ${widgets.find((widget) => widget.id === id)?.label}`}
                    className="rounded p-1 text-stone-500 hover:bg-stone-100 disabled:opacity-30"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeWidget(id)}
                    aria-label={`Retirer ${widgets.find((widget) => widget.id === id)?.label}`}
                    className="rounded p-1 text-stone-500 hover:bg-red-50 hover:text-red-700"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 flex gap-2">
            <select
              value={widgetToAdd}
              onChange={(event) =>
                setWidgetToAdd(
                  widgets.find((widget) => widget.id === event.target.value)
                    ?.id ?? "",
                )
              }
              disabled={selectedIds.length >= 6}
              aria-label="Choisir un bloc à ajouter"
              className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-2 py-2 text-xs text-stone-700 disabled:opacity-50"
            >
              <option value="">Ajouter un bloc…</option>
              {widgets
                .filter((widget) => !selectedIds.includes(widget.id))
                .map((widget) => (
                  <option key={widget.id} value={widget.id}>
                    {widget.label}
                  </option>
                ))}
            </select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addWidget}
              disabled={!widgetToAdd || selectedIds.length >= 6}
              aria-label="Ajouter le bloc sélectionné"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {selectedIds.map((id) => {
          const widget = content[id];
          const Icon = widget.icon;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(widget.view)}
              className="flex w-full items-start gap-2 rounded-2xl border border-stone-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-stone-900">
                  {widget.title}
                </span>
                <span className="mt-1 block truncate text-sm leading-5 text-stone-500">
                  {widget.detail}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
