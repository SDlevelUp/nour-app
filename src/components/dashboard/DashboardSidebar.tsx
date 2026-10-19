import { ChevronLeft, ChevronRight, LayoutGrid, LogOut, MoonStar, X } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  dashboardNavigation,
  dashboardNavigationGroups,
  type DashboardView,
} from "./dashboardNavigation";

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

// Étoile à 8 branches (khatam) : deux carrés superposés, en traits.
export function NourMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="8" y="8" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect
        x="8"
        y="8"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        transform="rotate(45 20 20)"
      />
    </svg>
  );
}

const mobileTabs = dashboardNavigation.filter((item) => item.group === "daily");
const moreItems = dashboardNavigation.filter((item) => item.group !== "daily");

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
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const initials = firstName
    ? firstName.slice(0, 1).toLocaleUpperCase("fr-FR")
    : "N";
  const isMoreActive = moreItems.some((item) => item.view === activeView);

  const excuseToggle = (
    <div className="flex items-start gap-2.5">
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold leading-4">
          Indisponibilité légale (‘Udhr)
        </span>
        <span className="mt-1 block text-[12px] leading-4 opacity-70">
          Masque les créneaux de prière du planning
        </span>
      </span>
      <Switch
        checked={isExcusePeriod}
        onCheckedChange={onExcusePeriodChange}
        aria-label="Activer l’indisponibilité légale Al-Udhr"
      />
    </div>
  );

  return (
    <>
      <aside
        className={`n-sidebar fixed inset-y-0 left-0 z-40 hidden flex-col py-6 transition-[width,padding] duration-300 ease-in-out lg:flex ${
          isCollapsed ? "w-18 items-center px-2" : "w-65 px-4"
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
            className={`flex items-center text-left ${isCollapsed ? "" : "gap-2.5 px-2"}`}
            aria-label="Nour, aujourd’hui"
            title={isCollapsed ? "Nour, aujourd’hui" : undefined}
          >
            <NourMark className="size-8 text-(--n-sage)" />
            {!isCollapsed && <span className="n-display text-2xl">Nour</span>}
          </button>
          {!isCollapsed && (
            <button
              type="button"
              onClick={onCollapse}
              className="n-nav-item w-auto! p-1.5!"
              aria-label="Replier la barre latérale"
              title="Replier la barre latérale"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
        </div>

        <nav aria-label="Navigation principale" className="mt-8 w-full space-y-6">
          {dashboardNavigationGroups.map((group) => (
            <div key={group.id}>
              {!isCollapsed && <p className="n-nav-heading">{group.label}</p>}
              <div className="space-y-0.5">
                {dashboardNavigation
                  .filter((item) => item.group === group.id)
                  .map(({ label, view, icon: Icon }) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => onNavigate(view)}
                      aria-current={activeView === view ? "page" : undefined}
                      data-collapsed={isCollapsed}
                      title={isCollapsed ? label : undefined}
                      aria-label={isCollapsed ? label : undefined}
                      className="n-nav-item"
                    >
                      <Icon className="size-4.5 shrink-0" strokeWidth={1.8} />
                      {!isCollapsed && <span>{label}</span>}
                      {view === "notes" && hasUnreadNotes && (
                        <span
                          className={`n-unread ${isCollapsed ? "absolute right-2 top-2" : "ml-auto"}`}
                          role="status"
                          aria-label="Nouvelle note non consultée"
                        />
                      )}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </nav>

        {!isCollapsed ? (
          <div className="n-panel mt-6 w-full p-3">{excuseToggle}</div>
        ) : (
          <button
            type="button"
            onClick={() => onExcusePeriodChange(!isExcusePeriod)}
            aria-pressed={isExcusePeriod}
            aria-label="Activer ou désactiver l’indisponibilité légale Al-Udhr"
            title="Indisponibilité légale (‘Udhr)"
            className="n-nav-item mt-4"
            data-collapsed="true"
            aria-current={isExcusePeriod ? "page" : undefined}
          >
            <MoonStar className="size-4" />
          </button>
        )}

        <div className={`mt-auto w-full ${isCollapsed ? "flex flex-col items-center gap-2" : ""}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 px-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--n-sage-tint) text-sm font-semibold">
                {initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {firstName || "Mon profil"}
                </span>
                <span className="block truncate text-xs opacity-70">
                  {email || "Espace personnel"}
                </span>
              </span>
            </div>
          )}
          <div className={isCollapsed ? "contents" : "mt-3 flex items-center justify-between px-2"}>
            {isCollapsed ? (
              <button
                type="button"
                onClick={() => onDarkModeChange(!isDarkMode)}
                className="n-nav-item"
                data-collapsed="true"
                aria-label="Activer ou désactiver le mode nuit"
                aria-pressed={isDarkMode}
                title="Mode nuit"
              >
                <MoonStar className="size-4" />
              </button>
            ) : (
              <label className="flex items-center gap-2 text-[13px] font-semibold">
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={onDarkModeChange}
                  aria-label="Activer le mode nuit"
                />
                Mode nuit
              </label>
            )}
            <button
              type="button"
              onClick={onSignOut}
              className={`n-nav-item ${isCollapsed ? "" : "w-auto! gap-1.5! px-2! py-1.5! text-[13px]"}`}
              data-collapsed={isCollapsed}
              aria-label="Se déconnecter"
              title="Se déconnecter"
            >
              <LogOut className="size-4" />
              {!isCollapsed && "Quitter"}
            </button>
          </div>
        </div>

        {isCollapsed && (
          <button
            type="button"
            onClick={onCollapse}
            className="absolute right-0 top-1/2 flex size-7 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-(--n-line) bg-(--n-paper) text-(--n-muted) transition hover:text-(--n-ink)"
            aria-label="Déplier la barre latérale"
            title="Déplier la barre latérale"
          >
            <ChevronRight className="size-4" />
          </button>
        )}
      </aside>

      {/* Mobile : barre d'onglets en pilule + panneau « Plus » */}
      <nav aria-label="Navigation principale" className="n-tabbar lg:hidden">
        {mobileTabs.map(({ label, view, icon: Icon }) => (
          <button
            key={view}
            type="button"
            onClick={() => {
              setIsMoreOpen(false);
              onNavigate(view);
            }}
            aria-current={activeView === view && !isMoreOpen ? "page" : undefined}
            aria-label={label}
            className="n-tab"
          >
            <Icon className="size-5 shrink-0" strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setIsMoreOpen((open) => !open)}
          aria-expanded={isMoreOpen}
          aria-current={isMoreActive || isMoreOpen ? "page" : undefined}
          aria-label="Plus"
          className="n-tab"
        >
          <LayoutGrid className="size-5 shrink-0" strokeWidth={1.8} />
          <span>Plus</span>
          {hasUnreadNotes && !isMoreOpen && (
            <span className="n-unread" role="status" aria-label="Nouvelle note non consultée" />
          )}
        </button>
      </nav>

      {isMoreOpen && (
        <div className="lg:hidden">
          <button
            type="button"
            className="n-sheet-backdrop"
            aria-label="Fermer le menu"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="n-sheet" role="dialog" aria-label="Plus">
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="n-label">Plus</span>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="n-nav-item w-auto! p-1.5!"
                aria-label="Fermer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-0.5">
              {moreItems.map(({ label, view, icon: Icon }) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    onNavigate(view);
                  }}
                  aria-current={activeView === view ? "page" : undefined}
                  className="n-nav-item"
                >
                  <Icon className="size-4.5 shrink-0" strokeWidth={1.8} />
                  <span>{label}</span>
                  {view === "notes" && hasUnreadNotes && (
                    <span className="n-unread ml-auto" role="status" aria-label="Nouvelle note non consultée" />
                  )}
                </button>
              ))}
            </div>
            <div className="n-panel mt-3 p-3">{excuseToggle}</div>
            <div className="mt-3 flex items-center justify-between px-1">
              <label className="flex items-center gap-2 text-[13px] font-semibold">
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={onDarkModeChange}
                  aria-label="Activer le mode nuit"
                />
                Mode nuit
              </label>
              <button
                type="button"
                onClick={onSignOut}
                className="n-nav-item w-auto! gap-1.5! px-2! py-1.5! text-[13px]"
              >
                <LogOut className="size-4" />
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
