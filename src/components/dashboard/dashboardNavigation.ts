import {
  BookOpen,
  CalendarClock,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  StickyNote,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type DashboardView =
  | "overview"
  | "salah"
  | "quran"
  | "science"
  | "periods"
  | "notes"
  | "settings";

export const dashboardNavigation: {
  label: string;
  view: DashboardView;
  targetId: string;
  icon: LucideIcon;
}[] = [
  {
    label: "Overview",
    view: "overview",
    targetId: "dashboard-home",
    icon: LayoutDashboard,
  },
  {
    label: "Planning",
    view: "salah",
    targetId: "dashboard-salah",
    icon: CalendarClock,
  },
  {
    label: "Al-Quran",
    view: "quran",
    targetId: "dashboard-quran",
    icon: BookOpen,
  },
  {
    label: "Science bénéfique",
    view: "science",
    targetId: "dashboard-science",
    icon: GraduationCap,
  },
  {
    label: "Périodes d’excuse",
    view: "periods",
    targetId: "dashboard-status",
    icon: CalendarDays,
  },
  {
    label: "Notes",
    view: "notes",
    targetId: "dashboard-notes",
    icon: StickyNote,
  },
  {
    label: "Réglages",
    view: "settings",
    targetId: "dashboard-settings",
    icon: Settings,
  },
];
