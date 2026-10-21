import { Plus, type LucideIcon } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

// Carte d'ajout repliable (remplace <details> et son triangle natif).
export function ComposerCard({
  title,
  hint,
  icon: Icon,
  defaultOpen = false,
  hidden,
  className = "",
  children,
}: {
  title: string;
  hint: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  hidden?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId();
  return (
    <section className={`n-card n-composer ${className}`} data-open={isOpen} hidden={hidden}>
      <button
        type="button"
        className="n-composer-head"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="n-composer-icon" aria-hidden="true">
          <Icon className="size-5" strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="n-display block text-[19px] leading-tight">{title}</span>
          <span className="mt-0.5 block text-[14px] text-(--n-muted)">{hint}</span>
        </span>
        <span className="n-composer-toggle" aria-hidden="true">
          <Plus className="size-4.5" strokeWidth={2} />
        </span>
      </button>
      {isOpen && (
        <div id={panelId} className="n-composer-body">
          {children}
        </div>
      )}
    </section>
  );
}
