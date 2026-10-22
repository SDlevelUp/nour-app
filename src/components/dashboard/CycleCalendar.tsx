import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, type ComponentProps } from "react";
import { DayPicker, type DayButton } from "react-day-picker";
import { fr } from "react-day-picker/locale";

// Calendrier du cycle (inspiration Flo, demandes de Sarah du 2026-10-22) :
// - en lecture, toucher un jour choisit la date (note, observations) ;
// - en modification, chaque jour devient une case ronde à cocher ou décocher.
function CycleDayButton({ day, modifiers, ...props }: ComponentProps<typeof DayButton>) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  const isEditing = modifiers.editing === true;
  const isChecked = isEditing && modifiers.period === true;
  return (
    <button
      ref={ref}
      {...props}
      className="n-cal-day"
      data-editing={isEditing}
      data-checked={isChecked}
      data-period={!isEditing && modifiers.period === true}
      data-picked={!isEditing && modifiers.picked === true}
      data-today={modifiers.today === true}
      data-outside={modifiers.outside === true}
      aria-pressed={isEditing ? isChecked : undefined}
    >
      <span>{day.date.getDate()}</span>
      {isChecked && (
        <span className="n-cal-check" aria-hidden="true">
          <Check className="size-2.5" strokeWidth={3.5} />
        </span>
      )}
    </button>
  );
}

export function CycleCalendar({
  month,
  onMonthChange,
  periodDates,
  isEditing,
  selectedDate,
  onDayClick,
}: {
  month: Date;
  onMonthChange: (month: Date) => void;
  // Règles enregistrées, ou brouillon en cours de modification.
  periodDates: Date[];
  isEditing: boolean;
  selectedDate: Date;
  onDayClick: (date: Date) => void;
}) {
  return (
    <DayPicker
      locale={fr}
      showOutsideDays
      month={month}
      onMonthChange={onMonthChange}
      onDayClick={onDayClick}
      modifiers={{
        period: periodDates,
        picked: selectedDate,
        editing: () => isEditing,
      }}
      className="n-cal"
      classNames={{
        months: "n-cal-months",
        month: "n-cal-month",
        month_caption: "n-cal-caption",
        caption_label: "n-cal-caption-label",
        nav: "n-cal-nav",
        button_previous: "n-cal-nav-btn",
        button_next: "n-cal-nav-btn",
        month_grid: "n-cal-grid",
        weekdays: "n-cal-weekdays",
        weekday: "n-cal-weekday",
        week: "n-cal-week",
        day: "n-cal-cell",
      }}
      components={{
        DayButton: CycleDayButton,
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ),
      }}
    />
  );
}
