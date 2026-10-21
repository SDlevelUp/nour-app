import { Bell, LogOut, MoonStar } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { annonces } from "@/data/annonces";

// Annonces lues : mémorisées sur l'appareil (décision du 2026-10-21).
const seenStorageKey = "nour-annonces-vues";

function readSeen(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(seenStorageKey) ?? "[]");
    return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

// Panneau qui se ferme au clic extérieur et avec Échap.
function Popover({
  trigger,
  isOpen,
  onOpenChange,
  label,
  children,
}: {
  trigger: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onOpenChange(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onOpenChange]);
  return (
    <div ref={ref} className="relative">
      {trigger}
      {isOpen && (
        <div className="n-popover" role="dialog" aria-label={label}>
          {children}
        </div>
      )}
    </div>
  );
}

export function TopActions({
  firstName,
  email,
  isDarkMode,
  onDarkModeChange,
  onSignOut,
}: {
  firstName: string;
  email?: string;
  isDarkMode: boolean;
  onDarkModeChange: (enabled: boolean) => void;
  onSignOut: () => void;
}) {
  const [seen, setSeen] = useState(readSeen);
  const [openMenu, setOpenMenu] = useState<"bell" | "profile" | null>(null);
  const unreadCount = annonces.filter((annonce) => !seen.includes(annonce.id)).length;
  const initial = firstName ? firstName.slice(0, 1).toLocaleUpperCase("fr-FR") : "N";

  const openBell = (open: boolean) => {
    setOpenMenu(open ? "bell" : null);
    if (open && unreadCount > 0) {
      const ids = annonces.map((annonce) => annonce.id);
      setSeen(ids);
      try {
        localStorage.setItem(seenStorageKey, JSON.stringify(ids));
      } catch {
        // Stockage indisponible : la pastille reviendra au prochain chargement.
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover
        label="Nouveautés"
        isOpen={openMenu === "bell"}
        onOpenChange={openBell}
        trigger={
          <button
            type="button"
            className="n-top-btn"
            aria-label={unreadCount > 0 ? `Nouveautés, ${unreadCount} non lues` : "Nouveautés"}
            aria-expanded={openMenu === "bell"}
            onClick={() => openBell(openMenu !== "bell")}
          >
            <Bell className="size-4.5" strokeWidth={1.8} />
            {unreadCount > 0 && <span className="n-top-badge">{unreadCount}</span>}
          </button>
        }
      >
        <p className="n-display px-1 text-[17px]">Nouveautés</p>
        <ul className="mt-2 max-h-[min(60vh,420px)] overflow-y-auto">
          {annonces.map((annonce) => (
            <li key={annonce.id} className="n-annonce">
              <time dateTime={annonce.date}>
                {new Date(`${annonce.date}T12:00:00`).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                })}
              </time>
              <p className="font-semibold">{annonce.title}</p>
              <p className="mt-0.5 text-(--n-muted)">{annonce.text}</p>
            </li>
          ))}
        </ul>
      </Popover>

      <Popover
        label="Mon profil"
        isOpen={openMenu === "profile"}
        onOpenChange={(open) => setOpenMenu(open ? "profile" : null)}
        trigger={
          <button
            type="button"
            className="n-top-avatar"
            aria-label="Mon profil"
            aria-expanded={openMenu === "profile"}
            onClick={() => setOpenMenu(openMenu === "profile" ? null : "profile")}
          >
            {initial}
          </button>
        }
      >
        <div className="px-1">
          <p className="truncate font-semibold">{firstName || "Mon profil"}</p>
          <p className="truncate text-[13px] text-(--n-muted)">{email || "Espace personnel"}</p>
        </div>
        <div className="mt-3 border-t border-(--n-line) pt-2">
          <label className="n-popover-row">
            <MoonStar className="size-4" strokeWidth={1.8} />
            <span className="flex-1">Mode nuit</span>
            <Switch checked={isDarkMode} onCheckedChange={onDarkModeChange} aria-label="Mode nuit" />
          </label>
          <button type="button" className="n-popover-row w-full" onClick={onSignOut}>
            <LogOut className="size-4" strokeWidth={1.8} />
            <span className="flex-1 text-left">Se déconnecter</span>
          </button>
        </div>
      </Popover>
    </div>
  );
}
