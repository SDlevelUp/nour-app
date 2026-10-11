import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  LogOut,
  MoonStar,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { dashboardNavigation, type DashboardView } from "./dashboardNavigation";

type DashboardSidebarProps = {
  activeView: DashboardView;
  firstName: string;
  email?: string;
  hasUnreadNotes: boolean;
  isExcusePeriod: boolean;
  isCollapsed: boolean;
  isDarkMode: boolean;
  onNavigate: (view: DashboardView) => void;
  onExcusePeriodChange: (enabled: boolean) => void;
  onCollapse: () => void;
  onDarkModeChange: (enabled: boolean) => void;
  onSignOut: () => void;
};

export function DashboardSidebar({
  activeView,
  firstName,
  email,
  hasUnreadNotes,
  isExcusePeriod,
  isCollapsed,
  isDarkMode,
  onNavigate,
  onExcusePeriodChange,
  onCollapse,
  onDarkModeChange,
  onSignOut,
}: DashboardSidebarProps) {
  const initials = firstName
    ? firstName.slice(0, 1).toLocaleUpperCase("fr-FR")
    : "N";

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-[#ECE7DF] bg-white py-6 transition-[width,padding] duration-300 ease-in-out lg:flex ${
          isCollapsed ? "w-18 items-center px-2" : "w-65 px-5"
        }`}
      >
        <div
          className={`flex w-full items-center ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <button
            type="button"
            onClick={() => onNavigate("overview")}
            className={`flex items-center text-left ${
              isCollapsed ? "" : "gap-3 px-2"
            }`}
            aria-label="Nour, accueil"
            title={isCollapsed ? "Nour, accueil" : undefined}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#523B46] text-white">
              <MoonStar className="size-5" aria-hidden="true" />
            </span>
            {!isCollapsed && (
              <span className="text-xl font-semibold tracking-tight text-foreground">
                nour
              </span>
            )}
          </button>
          {!isCollapsed && (
            <button
              type="button"
              onClick={onCollapse}
              className="flex size-8 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
              aria-label="Replier la barre latérale"
              title="Replier la barre latérale"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
        </div>

        <p
          className={`mb-3 mt-10 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400 ${
            isCollapsed ? "text-center" : "px-3"
          }`}
        >
          {isCollapsed ? "Menu" : "Espace personnel"}
        </p>
        <nav
          aria-label="Navigation principale"
          className={`w-full space-y-1 ${isCollapsed ? "px-0.5" : ""}`}
        >
          {dashboardNavigation.map(({ label, view, icon: Icon }) => {
            const isActive = activeView === view;
            return (
              <button
                key={view}
                type="button"
                onClick={() => onNavigate(view)}
                aria-current={isActive ? "page" : undefined}
                title={isCollapsed ? label : undefined}
                aria-label={isCollapsed ? label : undefined}
                className={`relative flex w-full items-center rounded-xl py-3 text-sm transition ${
                  isCollapsed ? "justify-center px-0" : "gap-3 px-3 text-left"
                } hover:bg-[#E8F0E8] ${
                  isActive
                    ? "font-semibold text-[#35533D]"
                    : "text-stone-600 hover:text-[#35533D]"
                }`}
              >
                <Icon className="size-4.5 shrink-0" strokeWidth={1.8} />
                {!isCollapsed && <span>{label}</span>}
                {view === "notes" && hasUnreadNotes && isCollapsed && (
                  <span
                    className="absolute right-2 top-2 size-2 rounded-full bg-red-600"
                    role="status"
                    aria-label="Nouvelle note non consultée"
                  />
                )}
                {view === "notes" && hasUnreadNotes && !isCollapsed && (
                  <span
                    className="ml-auto size-2 rounded-full bg-red-600"
                    role="status"
                    aria-label="Nouvelle note non consultée"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {!isCollapsed ? (
          <div className="mt-5 rounded-xl border border-[#ECE7DF] bg-white p-3">
            <div className="flex items-start gap-2.5">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-[#523B46]" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold leading-4 text-stone-900">
                  Activer l’indisponibilité légale (‘Udhr)
                </span>
                <span className="mt-1 block text-[10px] leading-4 text-stone-500">
                  Masquer les créneaux de prière du planning
                </span>
              </span>
              <Switch
                checked={isExcusePeriod}
                onCheckedChange={onExcusePeriodChange}
                aria-label="Activer l’indisponibilité légale Al-Udhr"
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onExcusePeriodChange(!isExcusePeriod)}
            aria-pressed={isExcusePeriod}
            aria-label="Activer ou désactiver l’indisponibilité légale Al-Udhr"
            title="Indisponibilité légale (‘Udhr)"
            className={`mt-4 flex size-10 items-center justify-center rounded-xl transition ${
              isExcusePeriod
                ? "bg-amber-100 text-amber-900"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <CalendarDays className="size-4" />
          </button>
        )}

        {!isCollapsed && (
          <div className="mt-auto rounded-xl border border-[#ECE7DF] bg-white p-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-900">
                {initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-stone-900">
                  {firstName || "Mon profil"}
                </span>
                <span className="block truncate text-xs text-stone-500">
                  {email || "Espace personnel"}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-stone-600 transition hover:bg-white hover:text-stone-950"
            >
              <LogOut className="size-4" />
              Se déconnecter
            </button>
          </div>
        )}

        {isCollapsed ? (
          <div className="mt-auto flex flex-col items-center gap-2">
            <span
              className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-900"
              title={firstName || "Mon profil"}
            >
              {initials}
            </span>
            <button
              type="button"
              onClick={() => onDarkModeChange(!isDarkMode)}
              className={`flex size-10 items-center justify-center rounded-xl transition ${
                isDarkMode
                  ? "bg-emerald-100 text-emerald-900"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              }`}
              aria-label="Activer ou désactiver le mode nuit"
              aria-pressed={isDarkMode}
              title="Mode Nuit"
            >
              <MoonStar className="size-4" />
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="flex size-10 items-center justify-center rounded-xl text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
              aria-label="Se déconnecter"
              title="Se déconnecter"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <div className="mt-3 flex w-full items-center justify-between px-2 py-2">
            <span className="flex items-center gap-2 text-xs font-semibold text-stone-700">
              <MoonStar className="size-4" />
              Mode Nuit
            </span>
            <Switch
              checked={isDarkMode}
              onCheckedChange={onDarkModeChange}
              aria-label="Activer le mode nuit"
            />
          </div>
        )}
        {isCollapsed && (
          <button
            type="button"
            onClick={onCollapse}
            className="absolute right-0 top-1/2 flex size-7 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 shadow-sm transition hover:text-stone-900"
            aria-label="Déplier la barre latérale"
            title="Déplier la barre latérale"
          >
            <ChevronRight className="size-4" />
          </button>
        )}
      </aside>

      <nav
        aria-label="Navigation principale"
        className="sticky top-0 z-30 flex gap-1 overflow-x-auto border-b border-stone-200 bg-white/95 px-3 py-2 backdrop-blur lg:hidden"
      >
        {dashboardNavigation.map(({ label, view, icon: Icon }) => {
          const isActive = activeView === view;
          return (
            <button
              key={view}
              type="button"
              onClick={() => onNavigate(view)}
              aria-current={isActive ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition hover:bg-[#E8F0E8] ${
                isActive
                  ? "border-b-2 border-[#5D7C65] font-semibold text-[#35533D]"
                  : "text-stone-600 hover:text-[#35533D]"
              }`}
            >
              <Icon className="size-4" strokeWidth={1.8} />
              {label}
              {view === "notes" && hasUnreadNotes && (
                <span
                  className="size-2 rounded-full bg-red-600"
                  role="status"
                  aria-label="Nouvelle note non consultée"
                />
              )}
            </button>
          );
        })}
      </nav>
      <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-2 lg:hidden">
        <span className="text-xs font-medium text-stone-700">
          Activer l’indisponibilité légale (‘Udhr)
        </span>
        <Switch
          checked={isExcusePeriod}
          onCheckedChange={onExcusePeriodChange}
          aria-label="Activer l’indisponibilité légale Al-Udhr"
        />
      </div>
    </>
  );
}
