import * as PopoverPrimitive from "@radix-ui/react-popover";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { useCallback, useState } from "react";
import { Calendar } from "@/components/ui/calendar";

// Sélecteur de date aux couleurs de Rawdah, à la place du calendrier natif du navigateur.
// La valeur reste une chaîne « AAAA-MM-JJ », comme avec <input type="date">.
// Le calendrier s'ouvre dans .dashboard-shell pour reprendre ses couleurs et le mode nuit.
export function DateField({
  value,
  onChange,
  placeholder = "Choisir une date",
  clearable = false,
  disabled = false,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const selected = value ? parseISO(value) : undefined;
  const findShell = useCallback((element: HTMLButtonElement | null) => {
    if (element) setContainer(element.closest<HTMLElement>(".dashboard-shell"));
  }, []);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          ref={findShell}
          disabled={disabled}
          className={`n-input n-date-trigger ${className}`}
        >
          <CalendarDays className="size-4 shrink-0 text-(--n-sage)" strokeWidth={1.8} />
          <span className={selected ? "" : "text-(--n-muted)"}>
            {selected ? format(selected, "EEE d MMM yyyy", { locale: fr }) : placeholder}
          </span>
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={container}>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="n-date-pop"
          // Pas de focus automatique sur la flèche « mois précédent » à l’ouverture (Tab y mène toujours).
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Calendar
            mode="single"
            locale={fr}
            weekStartsOn={1}
            selected={selected}
            defaultMonth={selected}
            onSelect={(day) => {
              onChange(day ? format(day, "yyyy-MM-dd") : "");
              setOpen(false);
            }}
          />
          {clearable && value && (
            <button
              type="button"
              className="n-date-clear"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Effacer la date
            </button>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
