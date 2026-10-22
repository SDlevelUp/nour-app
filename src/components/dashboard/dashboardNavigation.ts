import {
  BookOpen,
  CalendarClock,
  GraduationCap,
  HandHeart,
  Moon,
  StickyNote,
  Settings,
  Sun,
  type LucideIcon,
} from "lucide-react";

export type DashboardView =
  | "overview"
  | "adhkar"
  | "salah"
  | "quran"
  | "science"
  | "periods"
  | "notes"
  | "settings";

export type DashboardNavigationGroup = "daily" | "deeper" | "other";

export const dashboardNavigationGroups: {
  id: DashboardNavigationGroup;
  label: string;
}[] = [
  { id: "daily", label: "Chaque jour" },
  { id: "deeper", label: "Approfondir" },
  { id: "other", label: "Autres" },
];

// « daily » = onglets de la barre mobile ; le reste passe dans « Plus ».
export const dashboardNavigation: {
  label: string;
  view: DashboardView;
  targetId: string;
  icon: LucideIcon;
  group: DashboardNavigationGroup;
}[] = [
  {
    label: "Aujourd’hui",
    view: "overview",
    targetId: "dashboard-home",
    icon: Sun,
    group: "daily",
  },
  {
    label: "Coran",
    view: "quran",
    targetId: "dashboard-quran",
    icon: BookOpen,
    group: "daily",
  },
  {
    label: "Adhkar",
    view: "adhkar",
    targetId: "dashboard-routine",
    icon: HandHeart,
    group: "daily",
  },
  {
    label: "Cycle",
    view: "periods",
    targetId: "dashboard-status",
    icon: Moon,
    group: "daily",
  },
  {
    label: "Science bénéfique",
    view: "science",
    targetId: "dashboard-science",
    icon: GraduationCap,
    group: "deeper",
  },
  {
    label: "Planning",
    view: "salah",
    targetId: "dashboard-salah",
    icon: CalendarClock,
    group: "deeper",
  },
  {
    label: "Notes",
    view: "notes",
    targetId: "dashboard-notes",
    icon: StickyNote,
    group: "deeper",
  },
  {
    label: "Réglages",
    view: "settings",
    targetId: "dashboard-settings",
    icon: Settings,
    group: "other",
  },
];
