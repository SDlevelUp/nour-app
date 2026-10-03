import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Heart, MoonStar, Sparkles, Sun } from "lucide-react";
import { useNavigate } from "react-router";

const practices = [
  { icon: MoonStar, label: "Dhikr", detail: "Un petit instant de rappel, à votre rythme." },
  { icon: Sun, label: "Adhkars", detail: "Des invocations du matin et du soir." },
  { icon: Heart, label: "Bienveillance", detail: "Aucune case à cocher. Rien à rattraper." },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="/" className="flex items-center gap-2.5" aria-label="Nour, accueil">
          <span className="flex size-9 items-center justify-center rounded-full bg-foreground text-background"><MoonStar className="size-4" /></span>
          <span className="text-lg font-semibold tracking-tight">nour<span className="text-muted-foreground">.</span></span>
        </a>
        <button onClick={() => navigate("/auth?returnTo=%2Fdashboard")} className="group flex items-center gap-2 text-sm font-medium">
          Entrer dans mon espace <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </header>

      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="pointer-events-none absolute -right-48 top-0 -z-0 size-[34rem] rounded-full border border-border/50 sm:right-[-12rem]" />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="relative z-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"><Sparkles className="size-3.5" /> Un compagnon de routine spirituelle</div>
          <h1 className="max-w-2xl font-serif text-5xl font-medium leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">Votre foi, à votre <span className="text-muted-foreground">rythme.</span></h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">Un espace personnel et apaisant pour garder près de vous le dhikr et les adhkars — notamment pendant les jours où vous avez besoin de ralentir.</p>
          <button onClick={() => navigate("/auth?returnTo=%2Fdashboard")} className="mt-8 inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-opacity hover:opacity-80">
            Ouvrir mon espace <ArrowRight className="size-4" />
          </button>
          <p className="mt-4 text-xs text-muted-foreground">Un espace rien qu’à vous. Sans pression, sans jugement.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }} className="relative z-10 mx-auto w-full max-w-md">
          <div className="rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[0_20px_70px_-40px_rgba(0,0,0,0.18)] sm:p-8">
            <div className="flex items-center justify-between border-b border-border/70 pb-5">
              <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Votre espace, aujourd’hui</p><p className="mt-2 font-serif text-2xl">Salam, ma sœur.</p></div>
              <span className="flex size-10 items-center justify-center rounded-full bg-secondary"><Heart className="size-4" /></span>
            </div>
            <div className="mt-6 rounded-2xl bg-secondary/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Période de pause</p>
              <p className="mt-2 text-sm leading-6">Votre routine reste douce. Prenez ce qui vous fait du bien, laissez le reste.</p>
            </div>
            <div className="mt-6 flex items-end justify-between">
              <div><p className="text-xs text-muted-foreground">Un instant de dhikr</p><p lang="ar" dir="rtl" className="mt-2 font-serif text-3xl">سُبْحَانَ اللَّهِ</p><p className="mt-1 text-sm">SubhanAllah</p></div>
              <span className="flex size-11 items-center justify-center rounded-full border border-border text-lg">+</span>
            </div>
            <div className="mt-6 flex items-center gap-2 border-t border-border/70 pt-4 text-xs text-muted-foreground"><Sun className="size-3.5" /> Un rappel doux, si vous le souhaitez <ArrowDown className="ml-auto size-3.5 -rotate-45" /></div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">Une présence discrète. Jamais une obligation.</p>
        </motion.div>
      </section>

      <section className="border-y border-border/70 bg-secondary/30">
        <div className="mx-auto grid max-w-6xl divide-y divide-border/70 px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0">
          {practices.map(({ icon: Icon, label, detail }, index) => (
            <motion.div key={label} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="flex gap-4 py-6 md:px-7 md:first:pl-0 md:last:pr-0">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background"><Icon className="size-4" /></span>
              <div><p className="text-sm font-semibold">{label}</p><p className="mt-1 text-sm text-muted-foreground">{detail}</p></div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-14 sm:flex-row sm:items-center sm:px-8 sm:py-20">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Un espace sans culpabilité</p><h2 className="mt-3 max-w-xl font-serif text-3xl leading-tight sm:text-4xl">Le lien ne se mesure pas au nombre de cases cochées.</h2></div>
        <button onClick={() => navigate("/auth?returnTo=%2Fdashboard")} className="group inline-flex shrink-0 items-center gap-2 border-b border-foreground pb-2 text-sm font-medium">Continuer vers mon espace <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></button>
      </section>
      <footer className="border-t border-border/70 px-5 py-5 text-center text-xs text-muted-foreground">nour. · Votre rythme est le bon.</footer>
    </main>
  );
}
