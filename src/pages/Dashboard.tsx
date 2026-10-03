import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowDown,
  Bell,
  Clock3,
  Heart,
  Leaf,
  LogOut,
  MoonStar,
  Plus,
  RotateCcw,
  Sparkles,
  Sun,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type ReminderPreferences = {
  morning: boolean;
  evening: boolean;
  morningTime: string;
  eveningTime: string;
};

type DhikrCounts = { subhanallah: number; alhamdulillah: number; allahuakbar: number };

const defaultReminders: ReminderPreferences = {
  morning: false,
  evening: false,
  morningTime: "06:30",
  eveningTime: "19:30",
};
const initialCounts: DhikrCounts = {
  subhanallah: 0,
  alhamdulillah: 0,
  allahuakbar: 0,
};
const morningMessages = [
  "Un nouveau matin, une nouvelle douceur. Si le cœur vous en dit, prenez un instant pour le dhikr.",
  "Que cette matinée vous apporte un peu de paix. Quelques mots suffisent, à votre rythme.",
  "Petit rappel tout doux : votre intention compte. Le dhikr vous attend quand vous le souhaitez.",
];
const eveningMessages = [
  "La journée peut ralentir. Offrez-vous un instant de dhikr, seulement si cela vous fait du bien.",
  "Un moment pour souffler et vous recentrer. Il n’y a rien à rattraper, juste à accueillir.",
  "Que votre soirée soit paisible. Une invocation, un souffle : c’est déjà beaucoup.",
];

function readStored<T,>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function todayKey() {
  return new Intl.DateTimeFormat("fr-CA").format(new Date());
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isPauseMode, setIsPauseMode] = useState(() =>
    readStored("nour-pause-mode", true),
  );
  const [reminders, setReminders] = useState<ReminderPreferences>(() =>
    readStored("nour-reminders", defaultReminders),
  );
  const [counts, setCounts] = useState<DhikrCounts>(() => {
    const saved = readStored<{ date: string; counts: DhikrCounts } | null>(
      "nour-dhikr-counts",
      null,
    );
    return saved?.date === todayKey() ? saved.counts : initialCounts;
  });
  const firedToday = useRef<Record<string, string>>({});
  const firstName = user?.name?.trim().split(" ")[0];

  useEffect(() => {
    localStorage.setItem("nour-pause-mode", JSON.stringify(isPauseMode));
  }, [isPauseMode]);

  useEffect(() => {
    localStorage.setItem("nour-reminders", JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(
      "nour-dhikr-counts",
      JSON.stringify({ date: todayKey(), counts }),
    );
  }, [counts]);

  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const checkReminders = () => {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const date = todayKey();
      const moments = [
        { key: "morning", enabled: reminders.morning, at: reminders.morningTime, messages: morningMessages, title: "Un instant pour vous" },
        { key: "evening", enabled: reminders.evening, at: reminders.eveningTime, messages: eveningMessages, title: "Une pause en douceur" },
      ];
      moments.forEach(({ key, enabled, at, messages, title }) => {
        if (enabled && time === at && firedToday.current[key] !== date) {
          firedToday.current[key] = date;
          const messageIndex = (now.getDate() + (key === "evening" ? 1 : 0)) % messages.length;
          new Notification(title, { body: messages[messageIndex], tag: `nour-${key}-${date}` });
        }
      });
    };
    checkReminders();
    const timer = window.setInterval(checkReminders, 15_000);
    return () => window.clearInterval(timer);
  }, [reminders]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const updateReminder = async (key: "morning" | "evening", enabled: boolean) => {
    if (enabled && !("Notification" in window)) {
      toast.message("Les notifications ne sont pas prises en charge par ce navigateur.");
      return;
    }
    if (enabled && Notification.permission !== "granted") {
      const permission = Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;
      if (permission !== "granted") {
        toast.message("Autorisez les notifications dans votre navigateur pour activer ce rappel.");
        return;
      }
    }
    setReminders((current) => ({ ...current, [key]: enabled }));
  };

  const changeCount = (key: keyof DhikrCounts, amount: number) => {
    setCounts((current) => ({ ...current, [key]: Math.max(0, current[key] + amount) }));
  };

  const dhikrItems: { key: keyof DhikrCounts; arabic: string; transliteration: string; translation: string }[] = [
    { key: "subhanallah", arabic: "سُبْحَانَ اللَّهِ", transliteration: "SubhanAllah", translation: "Gloire à Allah" },
    { key: "alhamdulillah", arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", translation: "Louange à Allah" },
    { key: "allahuakbar", arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", translation: "Allah est le plus grand" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="/dashboard" className="flex items-center gap-2.5" aria-label="Nour, accueil">
            <span className="flex size-9 items-center justify-center rounded-full bg-foreground text-background"><MoonStar className="size-4" /></span>
            <span className="text-lg font-semibold tracking-tight">nour<span className="text-muted-foreground">.</span></span>
          </a>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">Un espace rien qu’à vous</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-muted-foreground hover:text-foreground" aria-label="Se déconnecter">
              <LogOut className="size-4" /><span className="hidden sm:inline">Quitter</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <section className="min-w-0">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</p>
                <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">Salam{firstName ? `, ${firstName}` : ""}.</h1>
                <p className="mt-3 max-w-lg text-base leading-7 text-muted-foreground">{isPauseMode ? "Aujourd’hui, on avance doucement. Votre lien à Allah se nourrit aussi de repos et de bienveillance." : "Un petit espace pour nourrir votre routine spirituelle, à votre rythme."}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border/80 px-3 py-2 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-foreground" /> Votre espace privé
              </div>
            </div>

            <Card className={`overflow-hidden rounded-2xl border shadow-none ${isPauseMode ? "bg-secondary/65" : "bg-card"}`}>
              <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background"><Heart className="size-5" strokeWidth={1.5} /></span>
                  <div>
                    <p className="text-sm font-semibold">Mode période de pause</p>
                    <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{isPauseMode ? "Votre routine reste centrée sur le dhikr et les adhkars. Aucune prière n’est suivie ici." : "Activez ce mode quand vous souhaitez un espace adapté, sans suivi des prières."}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-medium text-muted-foreground">{isPauseMode ? "Activé" : "Désactivé"}</span>
                  <Switch checked={isPauseMode} onCheckedChange={setIsPauseMode} aria-label="Activer le mode période de pause" />
                </div>
              </CardContent>
            </Card>

            <div className="mb-4 mt-11 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Votre pratique, sans pression</p>
                <h2 className="mt-2 font-serif text-2xl font-medium">Un instant de dhikr</h2>
              </div>
              <span className="hidden text-xs text-muted-foreground sm:inline">Reprenez quand vous voulez</span>
            </div>
            <div className="divide-y divide-border/80 rounded-2xl border border-border/80 bg-card">
              {dhikrItems.map((item) => (
                <div key={item.key} className="flex items-center gap-4 px-4 py-4 sm:px-5">
                  <div className="min-w-0 flex-1">
                    <p lang="ar" dir="rtl" className="text-right font-serif text-xl leading-8">{item.arabic}</p>
                    <p className="mt-0.5 text-sm font-medium">{item.transliteration}<span className="ml-2 font-normal text-muted-foreground">· {item.translation}</span></p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="icon" className="size-9 rounded-full text-muted-foreground" onClick={() => changeCount(item.key, -1)} aria-label={`Retirer une répétition de ${item.transliteration}`}><ArrowDown className="size-4" /></Button>
                    <span className="w-8 text-center text-sm tabular-nums">{counts[item.key]}</span>
                    <Button variant="outline" size="icon" className="size-9 rounded-full" onClick={() => changeCount(item.key, 1)} aria-label={`Ajouter une répétition de ${item.transliteration}`}><Plus className="size-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between px-1">
              <p className="text-xs text-muted-foreground">Chaque mot est précieux, même un seul.</p>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs text-muted-foreground" onClick={() => setCounts(initialCounts)}><RotateCcw className="size-3.5" /> Réinitialiser</Button>
            </div>

            <div className="mb-4 mt-12 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">À garder près de soi</p>
                <h2 className="mt-2 font-serif text-2xl font-medium">Adhkars du jour</h2>
              </div>
              <Sparkles className="size-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="rounded-2xl border-border/80 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><Sun className="size-4" /> LE MATIN</div>
                  <p lang="ar" dir="rtl" className="mt-5 text-right font-serif text-2xl leading-10">أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ</p>
                  <p className="mt-3 text-sm leading-6">Nous voici au matin, et le royaume appartient à Allah.</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">À lire après le Fajr, si ce moment vous convient.</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-border/80 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><MoonStar className="size-4" /> LE SOIR</div>
                  <p lang="ar" dir="rtl" className="mt-5 text-right font-serif text-2xl leading-10">أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ</p>
                  <p className="mt-3 text-sm leading-6">Nous voici au soir, et le royaume appartient à Allah.</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">Après l’Asr ou le Maghreb, selon votre habitude.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <aside className="space-y-5">
            <Card id="rappels" className="rounded-2xl border-border/80 shadow-none">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-secondary"><Bell className="size-4" /></span>
                  <div><p className="text-sm font-semibold">Rappels en douceur</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Choisissez vos moments. Aucun rappel n’est une obligation.</p></div>
                </div>
                <div className="mt-5 space-y-4">
                  <ReminderRow label="Après le Fajr" time={reminders.morningTime} enabled={reminders.morning} onTimeChange={(value) => setReminders((current) => ({ ...current, morningTime: value }))} onToggle={(value) => void updateReminder("morning", value)} icon={<Sun className="size-4" />} />
                  <div className="border-t border-border/70" />
                  <ReminderRow label="Après l’Asr / Maghreb" time={reminders.eveningTime} enabled={reminders.evening} onTimeChange={(value) => setReminders((current) => ({ ...current, eveningTime: value }))} onToggle={(value) => void updateReminder("evening", value)} icon={<MoonStar className="size-4" />} />
                </div>
                <p className="mt-4 flex gap-2 rounded-xl bg-secondary/70 p-3 text-[11px] leading-5 text-muted-foreground"><Clock3 className="mt-0.5 size-3.5 shrink-0" /> Les rappels apparaissent à l’heure choisie lorsque cette page reste ouverte et que les notifications du navigateur sont autorisées.</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/80 bg-secondary/50 shadow-none">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"><Leaf className="size-4" /> Un mot pour aujourd’hui</div>
                <p className="mt-4 font-serif text-xl leading-8">« Le repos aussi peut être une façon de prendre soin de soi. »</p>
                <p className="mt-3 text-xs text-muted-foreground">Pas de retard à rattraper. Pas de score à atteindre.</p>
              </CardContent>
            </Card>

            <div className="px-1 pt-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Notre intention</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Ici, pas de suivi des prières ni d’alternatives à la Salat. Uniquement un compagnon discret pour votre routine autorisée.</p>
            </div>
          </aside>
        </div>
        <footer className="mt-14 flex flex-col gap-2 border-t border-border/70 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>nour. · Votre rythme est le bon.</span>
          <span>Vos préférences restent sur cet appareil.</span>
        </footer>
      </div>
    </main>
  );
}

function ReminderRow({
  label,
  time,
  enabled,
  onTimeChange,
  onToggle,
  icon,
}: {
  label: string;
  time: string;
  enabled: boolean;
  onTimeChange: (value: string) => void;
  onToggle: (value: boolean) => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <label className="text-xs font-medium">{label}</label>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3" /><input type="time" value={time} onChange={(event) => onTimeChange(event.target.value)} className="w-[4.5rem] bg-transparent tabular-nums outline-none" aria-label={`Heure du rappel ${label}`} /></div>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} aria-label={`Activer le rappel ${label}`} />
    </div>
  );
}
