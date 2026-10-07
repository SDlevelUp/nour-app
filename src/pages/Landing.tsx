import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  Heart,
  MoonStar,
  Smartphone,
  Sparkles,
  Sun,
  TimerReset,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const practices = [
  {
    icon: MoonStar,
    label: "Dhikr",
    detail: "Un instant de rappel, à ton rythme.",
  },
  {
    icon: Sun,
    label: "Adhkars",
    detail: "Les invocations du matin et du soir.",
  },
  {
    icon: Heart,
    label: "Bienveillance",
    detail: "Rien à rattraper, rien à prouver.",
  },
];

const benefits = [
  {
    icon: Bell,
    title: "Des rappels doux",
    text: "Un petit souvenir au bon moment pour rester proche de ta routine, sans pression.",
  },
  {
    icon: BookOpen,
    title: "Une pratique lisible",
    text: "Chaque invocation est facile à retrouver, même dans les journées chargées.",
  },
  {
    icon: TimerReset,
    title: "À ton rythme",
    text: "Aucune exigence, aucun sentiment de retard : ouvre l’app quand tu le souhaites.",
  },
  {
    icon: Smartphone,
    title: "Toujours accessible",
    text: "Un espace personnel simple à garder sur ton téléphone, au quotidien.",
  },
];

const faqs = [
  {
    question: "Est-ce que l’application impose une routine stricte ?",
    answer:
      "Non. Nour est pensé pour être bienveillant : le but n’est pas la perfection, mais une présence douce et régulière.",
  },
  {
    question: "Peut-on l’utiliser sans se sentir stressée ?",
    answer:
      "Oui. Nour t’accompagne dans ton rythme personnel, avec des rappels et des dhikrs sans pression.",
  },
  {
    question: "Puis-je faire une pause pendant mes règles ?",
    answer:
      "Oui. Le suivi du cycle et le mode Al-‘Udhr t’aident à adapter ton planning à ta situation.",
  },
  {
    question: "Faut-il installer l’application ?",
    answer:
      "Nour est accessible depuis ton navigateur. Tu peux aussi l’ajouter à l’écran d’accueil de ton téléphone.",
  },
];

const previewEvents = [
  {
    time: "05:48",
    title: "Fajr & adhkars du matin",
    detail: "Prière · invocations du matin",
    tone: "border-[#ECE7DF] bg-[#F3EFEC]",
    marker: "bg-[#523B46]",
  },
  {
    time: "09:00",
    title: "Lecture du Coran",
    detail: "Un moment pour reprendre doucement",
    tone: "border-[#ECE7DF] bg-white",
    marker: "bg-[#8B707D]",
  },
  {
    time: "13:20",
    title: "Dhuhr",
    detail: "Prière selon l’horaire local",
    tone: "border-[#ECE7DF] bg-[#F5F2EE]",
    marker: "bg-[#93806E]",
  },
  {
    time: "18:45",
    title: "Étude bénéfique",
    detail: "Quelques pages, sans pression",
    tone: "border-[#ECE7DF] bg-white",
    marker: "bg-[#B39AA3]",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [isDarkMode] = useState(() => {
    try {
      return localStorage.getItem("nour-dark-mode") === "true";
    } catch {
      return false;
    }
  });
  const today = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const openDashboard = () => navigate("/auth?returnTo=%2Fdashboard");

  return (
    <main
      className={`landing-page min-h-screen overflow-hidden bg-[#FBF9F6] text-foreground transition-colors duration-300 ${isDarkMode ? "landing-dark" : ""}`}
    >
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5"
          aria-label="Nour, accueil"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MoonStar className="size-5" />
          </span>
          <span className="text-xl font-semibold tracking-tight">
            nour<span className="text-primary">.</span>
          </span>
        </button>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a className="transition hover:text-primary" href="#bienfaits">
            L’esprit Nour
          </a>
          <a className="transition hover:text-primary" href="#fonctionnalites">
            L’application
          </a>
          <a className="transition hover:text-primary" href="#faq">
            FAQ
          </a>
        </nav>

        <button
          type="button"
          onClick={openDashboard}
          className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/75 px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:bg-white"
        >
          Mon espace
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </header>

      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:min-h-[620px] lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ECE7DF] bg-white px-3.5 py-2 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            TON COMPAGNON SPIRITUEL
          </div>
          <h1 className="max-w-xl text-5xl font-semibold leading-[0.96] tracking-tight sm:text-[54px]">
            Fais de la place
            <br />
            à l’essentiel,
            <br />
            <span className="text-primary italic">en douceur.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Tes prières, tes adhkars et tes petits pas réunis dans un espace
            doux, pensé pour la vraie vie — et pour ton propre rythme.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={openDashboard}
              className="group inline-flex items-center gap-3 rounded-xl bg-[#523B46] px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#3D2A34]"
            >
              Entrer dans mon espace
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#fonctionnalites"
              className="inline-flex items-center gap-2 px-2 py-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
            >
              Découvrir Nour <ArrowDownRight className="size-4" />
            </a>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className="size-4 fill-[#B39AA3] text-primary" />
            Un espace rien qu’à toi. Sans pression, sans jugement.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22, rotate: 1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="relative z-10 mx-auto w-full max-w-[570px]"
        >
          <div className="relative rounded-xl border border-[#ECE7DF] bg-white p-3 sm:p-5">
            <div className="rounded-xl border border-[#ECE7DF] bg-[#FBF9F6] p-4 sm:p-6">
              <div className="flex items-center justify-between border-b border-[#ECE7DF] pb-4">
                <div>
                  <p className="text-xs font-semibold capitalize text-muted-foreground">
                    {today}
                  </p>
                  <h2 className="mt-1 text-3xl font-semibold text-foreground sm:text-4xl">
                    Ta journée
                  </h2>
                </div>
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#F3EFEC] text-primary">
                  <Sparkles className="size-5" />
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ["Fajr", "05:48"],
                  ["Dhuhr", "13:20"],
                  ["Asr", "16:42"],
                  ["Maghrib", "19:18"],
                ].map(([name, time]) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE7DF] bg-white px-2.5 py-1.5 text-xs text-primary"
                  >
                    <MoonStar className="size-3 text-primary" />
                    {name}
                    <span className="tabular-nums text-muted-foreground">
                      {time}
                    </span>
                  </span>
                ))}
              </div>

              <div className="mt-5 space-y-2.5">
                {previewEvents.map((event, index) => (
                  <motion.div
                    key={event.title}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.22 + index * 0.09 }}
                    className={`grid grid-cols-[48px_1fr] items-stretch gap-2.5 rounded-2xl border p-2.5 sm:grid-cols-[58px_1fr] sm:gap-3 sm:p-3 ${event.tone}`}
                  >
                    <span className="pt-1 text-xs font-semibold tabular-nums text-primary">
                      {event.time}
                    </span>
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`size-2.5 shrink-0 rounded-full ${event.marker}`}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-stone-900">
                          {event.title}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-stone-600">
                          {event.detail}
                        </span>
                      </span>
                      <Check className="ml-auto size-4 shrink-0 text-primary/70" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#ECE7DF] pt-4">
                <span className="text-sm text-muted-foreground">
                  Une journée à ton image
                </span>
                <span className="rounded-full bg-[#F3EFEC] px-3 py-1.5 text-xs font-semibold text-primary">
                  Tout en douceur
                </span>
              </div>
            </div>
          </div>
          <span className="absolute -bottom-5 -left-3 flex size-12 items-center justify-center rounded-xl border border-[#ECE7DF] bg-white text-primary sm:-left-6 sm:size-14">
            <Heart className="size-5 fill-[#B39AA3]" />
          </span>
          <span className="absolute -right-2 top-14 flex size-10 items-center justify-center rounded-xl border border-[#ECE7DF] bg-[#F5F2EE] text-primary sm:-right-5 sm:size-12">
            <Sun className="size-5" />
          </span>
        </motion.div>
      </section>

      <section id="bienfaits" className="border-y border-[#ECE7DF] bg-white">
        <div className="mx-auto grid max-w-6xl divide-y divide-[#ECE7DF] px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0">
          {practices.map(({ icon: Icon, label, detail }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 }}
              className="flex items-center gap-3 py-5 md:px-6 md:py-6 first:md:pl-0 last:md:pr-0"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#ECE7DF] bg-white text-primary">
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section
        id="fonctionnalites"
        className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Pensé pour tes journées
            </p>
            <h2 className="mt-2 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              Un petit espace pour rester proche de l’essentiel.
            </h2>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#ECE7DF] bg-white px-3 py-1.5 text-xs font-medium text-primary">
            <Check className="size-3.5" /> Simple, doux, utile
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="rounded-xl border border-[#ECE7DF] bg-white p-5"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#F3EFEC] text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-2xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {text}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      <section
        id="faq"
        className="mx-auto max-w-4xl px-5 pb-16 sm:px-8 sm:pb-24"
      >
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            FAQ
          </p>
          <h2 className="mt-2 text-4xl font-semibold sm:text-5xl">
            Quelques réponses, tout simplement.
          </h2>
        </div>

        <Accordion
          type="single"
          collapsible
          className="rounded-xl border border-[#ECE7DF] bg-white p-3"
        >
          {faqs.map(({ question, answer }) => (
            <AccordionItem
              key={question}
              value={question}
              className="rounded-2xl border-b-0 px-2"
            >
              <AccordionTrigger className="text-left text-base font-medium text-foreground">
                {question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-6 text-muted-foreground">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto mb-10 flex max-w-6xl flex-col items-start justify-between gap-6 rounded-xl border border-[#ECE7DF] bg-white px-6 py-10 sm:flex-row sm:items-center sm:px-10 sm:py-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Un espace sans culpabilité
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
            Le lien ne se mesure pas au nombre de cases cochées.
          </h2>
        </div>
        <button
          type="button"
          onClick={openDashboard}
          className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-[#3D2A34]"
        >
          Continuer vers mon espace
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </section>

      <footer className="border-t border-[#ECE7DF] px-5 py-6 text-center text-sm text-muted-foreground">
        nour. · Ton rythme est le bon.
      </footer>
    </main>
  );
}
