import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, type ComponentProps } from "react";
import { DayPicker, type DateRange, type DayButton, type Matcher } from "react-day-picker";
import { fr } from "react-day-picker/locale";

// Calendrier du cycle : jours ronds et espacés, coche sur les jours sélectionnés
// (inspiration Flo, demande de Sarah du 2026-10-22).
function CycleDayButton({ day, modifiers, ...props }: ComponentProps<typeof DayButton>) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  const isSelected = modifiers.selected === true;
  return (
    <button
      ref={ref}
      {...props}
      className="n-cal-day"
      data-selected={isSelected}
      data-period={modifiers.period === true}
      data-today={modifiers.today === true}
      data-outside={modifiers.outside === true}
    >
      <span>{day.date.getDate()}</span>
      {isSelected && (
        <span className="n-cal-check" aria-hidden="true">
          <Check className="size-2.5" strokeWidth={3.5} />
        </span>
      )}
    </button>
  );
}

export function CycleCalendar({
  selected,
  onSelect,
  month,
  onMonthChange,
  periodDates,
}: {
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  month: Date;
  onMonthChange: (month: Date) => void;
  periodDates: Matcher;
}) {
  return (
    <DayPicker
      mode="range"
      locale={fr}
      showOutsideDays
      selected={selected}
      onSelect={onSelect}
      month={month}
      onMonthChange={onMonthChange}
      modifiers={{ period: periodDates }}
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
