import {
  CirclePause,
  LayoutGrid,
  LogOut,
  PanelLeft,
  Plus,
  X,
} from "lucide-react";
import { Fragment, useState } from "react";
import { NourMark } from "@/components/NourMark";
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
}: DashboardSidebarProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const isMoreActive = moreItems.some((item) => item.view === activeView);

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
        className={`n-rail-shell fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-300 ease-in-out lg:flex ${
          isCollapsed ? "w-18" : "w-65"
        }`}
      >
        {/* Rail d'icônes */}
        <div className="n-rail">
          <button
            type="button"
            onClick={() => onNavigate("overview")}
            className="n-rail-logo"
            aria-label="Nour, aujourd’hui"
            data-tip="Nour"
          >
            <NourMark className="size-7 text-(--n-sage)" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate("notes")}
            className="n-rail-add"
            aria-label="Nouvelle note"
            data-tip="Nouvelle note"
          >
            <Plus className="size-4.5" strokeWidth={2.2} />
          </button>

          <nav aria-label="Navigation principale" className="n-rail-nav">
            {dashboardNavigation.map(({ label, view, icon: Icon }, index) => (
              <Fragment key={view}>
                {index > 0 && dashboardNavigation[index - 1].group !== dashboardNavigation[index].group && (
                  <span className="n-rail-sep" aria-hidden="true" />
                )}
                <button
                  type="button"
                  onClick={() => onNavigate(view)}
                  aria-current={activeView === view ? "page" : undefined}
                  aria-label={label}
                  data-tip={label}
                  className="n-rail-item"
                >
                  <Icon className="size-4.5" strokeWidth={1.7} />
                  {view === "notes" && hasUnreadNotes && (
                    <span className="n-rail-dot" role="status" aria-label="Nouvelle note non consultée" />
                  )}
                </button>
              </Fragment>
            ))}
          </nav>

          <div className="n-rail-foot">
            <button
              type="button"
              onClick={() => onExcusePeriodChange(!isExcusePeriod)}
              aria-pressed={isExcusePeriod}
              aria-label="Indisponibilité légale (‘Udhr)"
              data-tip={isExcusePeriod ? "‘Udhr activé" : "‘Udhr"}
              className="n-rail-item"
            >
              <CirclePause className="size-4.5" strokeWidth={1.7} />
            </button>
            <button
              type="button"
              onClick={onCollapse}
              aria-label={isCollapsed ? "Déplier le menu" : "Replier le menu"}
              data-tip={isCollapsed ? "Déplier le menu" : "Replier le menu"}
              className="n-rail-item"
            >
              <PanelLeft className="size-4.5" strokeWidth={1.7} />
            </button>
          </div>
        </div>

        {/* Panneau déplié : les pages en texte seul */}
        {!isCollapsed && (
          <div className="n-rail-panel">
            <p className="n-display px-2 text-[20px]">Nour</p>
            <nav aria-label="Pages" className="mt-6 space-y-5">
              {dashboardNavigationGroups.map((group) => (
                <div key={group.id}>
                  <p className="n-rail-heading">{group.label}</p>
                  {dashboardNavigation
                    .filter((item) => item.group === group.id)
                    .map(({ label, view }) => (
                      <button
                        key={view}
                        type="button"
                        onClick={() => onNavigate(view)}
                        aria-current={activeView === view ? "page" : undefined}
                        className="n-rail-link"
                      >
                        {label}
                        {view === "notes" && hasUnreadNotes && <span className="n-unread ml-auto" />}
                      </button>
                    ))}
                </div>
              ))}
            </nav>

            <div className="mt-auto space-y-3">
              <div className="n-panel p-3">{excuseToggle}</div>
            </div>
          </div>
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
