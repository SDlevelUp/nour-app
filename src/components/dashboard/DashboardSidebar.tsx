import {
  CirclePause,
  LayoutGrid,
  LogOut,
  PanelLeft,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  dashboardNavigation,
  dashboardNavigationGroups,
  type DashboardView,
} from "./dashboardNavigation";

type DashboardSidebarProps = {
  activeView: DashboardView;
  hasUnreadNotes: boolean;
  isExcusePeriod: boolean;
  isCollapsed: boolean;
  isDarkMode: boolean;
  onNavigate: (view: DashboardView) => void;
  onExcusePeriodChange: (enabled: boolean) => void;
  onCollapse: () => void;
  onDarkModeChange: (enabled: boolean) => void;
  onSignOut: () => void;
  isMenuOpen: boolean; // menu complet ouvert depuis le bouton du haut (mobile)
  onMenuOpenChange: (open: boolean) => void;
};

const mobileTabs = dashboardNavigation.filter((item) => item.group === "daily");
const moreItems = dashboardNavigation.filter((item) => item.group !== "daily");

export function DashboardSidebar({
  activeView,
  hasUnreadNotes,
  isExcusePeriod,
  isCollapsed,
  isDarkMode,
  onNavigate,
  onExcusePeriodChange,
  onCollapse,
  onDarkModeChange,
  onSignOut,
  isMenuOpen,
  onMenuOpenChange,
}: DashboardSidebarProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const isMoreActive = moreItems.some((item) => item.view === activeView);
  // Le panneau sert au bouton « Plus » (pages secondaires) et au menu du haut (toutes les pages).
  const isSheetOpen = isMoreOpen || isMenuOpen;
  const sheetItems = isMenuOpen ? dashboardNavigation : moreItems;
  const closeSheet = () => {
    setIsMoreOpen(false);
    onMenuOpenChange(false);
  };

  const excuseToggle = (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold leading-4">
          Indisponibilité (‘Udhr)
        </span>
        <Switch
          checked={isExcusePeriod}
          onCheckedChange={onExcusePeriodChange}
          aria-label="Activer l’indisponibilité légale Al-Udhr"
        />
      </div>
      <p className="mt-1.5 text-[12px] leading-[1.35] opacity-70">
        Masque les créneaux de prière du planning.
      </p>
    </div>
  );

  return (
    <>
      <aside
        className={`n-side fixed inset-y-0 left-0 z-40 hidden flex-col transition-[width] duration-300 ease-in-out lg:flex ${
          isCollapsed ? "w-18" : "w-65"
        }`}
        data-collapsed={isCollapsed}
      >
        <button
          type="button"
          onClick={() => onNavigate("overview")}
          className="n-side-logo"
          aria-label="Rawdah, aujourd’hui"
          data-tip={isCollapsed ? "Rawdah" : undefined}
        >
          <span className="n-display text-[20px]">{isCollapsed ? "R" : "Rawdah"}</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("notes")}
          className="n-side-add"
          aria-label="Nouvelle note"
          data-tip={isCollapsed ? "Nouvelle note" : undefined}
        >
          <Plus className="size-4.5 shrink-0" strokeWidth={2.2} />
          {!isCollapsed && <span>Nouvelle note</span>}
        </button>

        <nav aria-label="Navigation principale" className="n-side-nav">
          {dashboardNavigationGroups.map((group, groupIndex) => (
            <div key={group.id}>
              {isCollapsed
                ? groupIndex > 0 && <span className="n-side-sep" aria-hidden="true" />
                : <p className="n-side-heading">{group.label}</p>}
              {dashboardNavigation
                .filter((item) => item.group === group.id)
                .map(({ label, view, icon: Icon }) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => onNavigate(view)}
                    aria-current={activeView === view ? "page" : undefined}
                    aria-label={isCollapsed ? label : undefined}
                    data-tip={isCollapsed ? label : undefined}
                    className="n-side-item"
                  >
                    <Icon className="size-4.5 shrink-0" strokeWidth={1.7} />
                    {!isCollapsed && <span className="truncate">{label}</span>}
                    {view === "notes" && hasUnreadNotes && (
                      <span className="n-side-dot" role="status" aria-label="Nouvelle note non consultée" />
                    )}
                  </button>
                ))}
            </div>
          ))}
        </nav>

        <div className="n-side-foot">
          {isCollapsed ? (
            <button
              type="button"
              onClick={() => onExcusePeriodChange(!isExcusePeriod)}
              aria-pressed={isExcusePeriod}
              aria-label="Indisponibilité légale (‘Udhr)"
              data-tip={isExcusePeriod ? "‘Udhr activé" : "‘Udhr"}
              className="n-side-item"
            >
              <CirclePause className="size-4.5 shrink-0" strokeWidth={1.7} />
            </button>
          ) : (
            <div className="n-panel p-3">{excuseToggle}</div>
          )}
          <button
            type="button"
            onClick={onCollapse}
            aria-label={isCollapsed ? "Ouvrir le menu" : "Fermer le menu"}
            data-tip={isCollapsed ? "Ouvrir le menu" : undefined}
            className="n-side-item"
          >
            <PanelLeft className="size-4.5 shrink-0" strokeWidth={1.7} />
            {!isCollapsed && <span>Fermer le menu</span>}
          </button>
        </div>
      </aside>

      {/* Mobile : barre d'onglets en pilule + panneau « Plus » */}
      <nav aria-label="Navigation principale" className="n-tabbar lg:hidden">
        {mobileTabs.map(({ label, view, icon: Icon }) => (
          <button
            key={view}
            type="button"
            onClick={() => {
              closeSheet();
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
          onClick={() => {
            onMenuOpenChange(false);
            setIsMoreOpen((open) => !open);
          }}
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

      {isSheetOpen && (
        <div className="lg:hidden">
          <button
            type="button"
            className="n-sheet-backdrop"
            aria-label="Fermer le menu"
            onClick={() => closeSheet()}
          />
          <div className="n-sheet" role="dialog" aria-label={isMenuOpen ? "Menu" : "Plus"}>
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="n-label">{isMenuOpen ? "Menu" : "Plus"}</span>
              <button
                type="button"
                onClick={() => closeSheet()}
                className="n-nav-item w-auto! p-1.5!"
                aria-label="Fermer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-0.5">
              {sheetItems.map(({ label, view, icon: Icon }) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => {
                    closeSheet();
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
