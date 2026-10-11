import { MotionConfig, motion } from "framer-motion";
import {
  MoonStar,
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
    label: "Dhikr",
    detail: "Un instant de rappel, à ton rythme.",
  },
  {
    label: "Adhkars",
    detail: "Les invocations du matin et du soir.",
  },
  {
    label: "Bienveillance",
    detail: "Rien à rattraper, rien à prouver.",
  },
];

const productFeatures = [
  {
    title: "Prières & planning",
    text: "Retrouve tes horaires et les repères de ta journée dans un espace clair.",
  },
  {
    title: "Adhkar du matin et du soir",
    text: "Suis les invocations pas à pas et reprends ta routine à ton rythme.",
  },
  {
    title: "Journal Al-Qur’an",
    text: "Note les passages lus et retrouve où tu en étais dans ta lecture.",
  },
  {
    title: "Suivi des périodes",
    text: "Garde tes repères de cycle et adapte l’affichage de ton planning.",
  },
  {
    title: "Science bénéfique",
    text: "Note ce que tu apprends et conserve la source associée à chaque note.",
  },
];

const productModules = [
  { label: "Planning" },
  { label: "Adhkar" },
  { label: "Al-Qur’an" },
  { label: "Périodes" },
  { label: "Science bénéfique" },
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
    tone: "border-violet-100 bg-violet-50/80",
    marker: "bg-violet-800",
  },
  {
    time: "09:00",
    title: "Lecture du Coran",
    detail: "Un moment pour reprendre doucement",
    tone: "border-violet-100 bg-white/90",
    marker: "bg-violet-600",
  },
  {
    time: "13:20",
    title: "Dhuhr",
    detail: "Prière selon l’horaire local",
    tone: "border-violet-100 bg-purple-50/80",
    marker: "bg-fuchsia-400",
  },
  {
    time: "18:45",
    title: "Étude bénéfique",
    detail: "Quelques pages, sans pression",
    tone: "border-violet-100 bg-white/90",
    marker: "bg-fuchsia-400",
  },
];

const howSteps = [
  {
    eyebrow: "01 · Adhkar",
    title: "Retrouve les invocations du matin et du soir",
    detail:
      "Choisis un moment, avance invocation après invocation et garde le fil de ta pratique.",
    use: "Suis les invocations une à une, arrête-toi quand tu veux et retrouve facilement ta progression.",
    previewTitle: "Adhkar du matin",
    previewDetail: "Invocation 3 sur 8",
  },
  {
    eyebrow: "02 · Planning",
    title: "Rassemble tes repères pour la journée",
    detail:
      "Visualise tes prières et tes moments importants dans un planning clair, facile à suivre.",
    use: "Visualise tes horaires de prière au même endroit et organise le reste de ta journée en fonction de tes repères.",
    previewTitle: "Aujourd’hui",
    previewDetail: "Fajr · Dhuhr · Asr · Maghrib",
  },
  {
    eyebrow: "03 · À ton rythme",
    title: "Adapte ton espace à ta situation",
    detail:
      "Note ton cycle et active le mode Al-‘Udhr pour ajuster les créneaux du planning quand tu en as besoin.",
    use: "Note les jours de ton cycle et adapte les créneaux du planning à ta situation, selon tes besoins.",
    previewTitle: "Mon espace, mes repères",
    previewDetail: "Planning adapté à ta situation",
  },
  {
    eyebrow: "04 · Petits pas",
    title: "Reprends quand tu le souhaites",
    detail:
      "Retrouve tes progrès et tes notes sans série à maintenir ni retard à rattraper.",
    use: "Retrouve tes avancées après une pause et continue à ton rythme, sans série à maintenir ni retard à rattraper.",
    previewTitle: "Ta progression",
    previewDetail: "Tu avances à ton propre rythme",
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
    <MotionConfig reducedMotion="user">
      <main
        className={`landing-page min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300 ${isDarkMode ? "landing-dark" : ""}`}
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
        </button>
      </header>

      <section className="landing-hero relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-5 pb-16 pt-16 text-center sm:px-8 sm:pb-24 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10 flex w-full flex-col items-center"
        >
          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
            Fais de la place à l’essentiel,
            <span className="text-primary italic">en douceur.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Tes prières, tes adhkars et tes petits pas réunis dans un espace
            doux, pensé pour la vraie vie - et pour ton propre rythme.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={openDashboard}
              className="group inline-flex items-center gap-3 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Entrer dans mon espace
            </button>
            <a
              href="#fonctionnalites"
              className="inline-flex items-center gap-2 px-2 py-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
            >
              Découvrir Nour
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22, rotate: 1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="relative z-10 mx-auto w-full max-w-3xl"
        >
          <div className="landing-preview relative rounded-[28px] border border-white/80 bg-white/80 p-3 shadow-2xl shadow-violet-300/20 backdrop-blur-xl sm:p-5">
            <div className="rounded-[22px] border border-white/90 bg-white/75 p-4 shadow-inner sm:p-6">
              <div className="flex items-center justify-between border-b border-violet-100 pb-4">
                <div>
                  <p className="text-xs font-semibold capitalize text-muted-foreground">
                    {today}
                  </p>
                  <h2 className="mt-1 text-3xl font-semibold text-foreground sm:text-4xl">
                    Ta journée
                  </h2>
                </div>
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
                    className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-white px-2.5 py-1.5 text-xs text-primary"
                  >
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
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {event.title}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {event.detail}
                        </span>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-violet-100 pt-4">
              </div>
            </div>
          </div>
        </motion.div>
      </section>
      <section id="bienfaits" className="border-y border-white/70 bg-white/55 backdrop-blur">
        <div className="mx-auto grid max-w-6xl divide-y divide-violet-100 px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0">
          {practices.map(({ label, detail }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 }}
              className="flex items-center gap-3 py-5 md:px-6 md:py-6 first:md:pl-0 last:md:pr-0"
            >
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section
        id="comment-ca-marche"
        className="landing-steps relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <h2 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            Un compagnon qui suit ton rythme.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            Quelques repères simples pour nourrir ta pratique, sans pression et
            sans chercher à tout faire parfaitement.
          </p>
        </motion.div>

        <div className="landing-timeline relative space-y-7 sm:space-y-10">
          {howSteps.map(({ eyebrow, title, detail, use, previewTitle, previewDetail }, index) => {
            const copy = (
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -18 : 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className={`landing-step-copy ${index % 2 === 0 ? "sm:text-right" : "sm:text-left"}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  {eyebrow}
                </p>
                <h3 className="mt-2 text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                  {title}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {detail}
                </p>
              </motion.div>
            );
            const preview = (
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
                className="landing-step-preview rounded-[24px] border border-white/90 bg-white/75 p-4 shadow-xl shadow-violet-300/15 backdrop-blur sm:p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {previewTitle}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {previewDetail}
                    </p>
                  </div>
                </div>
                <div className="mt-4 border-t border-violet-100 pt-3">
                  <p className="text-xs leading-5 text-muted-foreground">
                    {use}
                  </p>
                </div>
              </motion.div>
            );

            return (
              <div
                key={eyebrow}
                className="landing-step-row relative grid items-center gap-4 sm:grid-cols-[1fr_64px_1fr] sm:gap-5"
              >
                <div className={index % 2 === 0 ? "sm:col-start-1" : "sm:col-start-3 sm:row-start-1"}>
                  {copy}
                </div>
                <div className={index % 2 === 0 ? "sm:col-start-3 sm:row-start-1" : "sm:col-start-1 sm:row-start-1"}>
                  {preview}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section
        id="fonctionnalites"
        className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mb-9 flex flex-col items-center gap-4 text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Pensé pour tes journées
            </p>
            <h2 className="mt-2 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              Un petit espace pour rester proche de l’essentiel.
            </h2>
          </div>
        </div>

        <div className="landing-product-layout grid gap-8 rounded-[32px] border border-white/90 p-5 shadow-xl shadow-violet-200/20 sm:p-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-10 lg:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Un espace à ton image
            </p>
            <h3 className="mt-3 max-w-lg text-3xl font-semibold leading-tight sm:text-4xl">
              Ta pratique, tes repères, au même endroit.
            </h3>
            <div className="mt-7 space-y-5">
              {productFeatures.map(({ title, text }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                  className="flex items-start gap-3.5"
                >
                  <div>
                    <h4 className="text-base font-semibold text-foreground">
                      {title}
                    </h4>
                    <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                      {text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="landing-product-window rounded-[26px] border border-white bg-white/90 p-3 shadow-2xl shadow-violet-300/25 sm:p-4">
            <div className="flex items-center justify-between gap-3 border-b border-violet-100 px-2 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold tracking-tight text-foreground">
                  nour
                </span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Ton espace quotidien
              </span>
            </div>

            <div className="mt-3 rounded-2xl bg-primary p-4 text-white sm:p-5">
              <p className="text-xs text-white/75">Espace personnel</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-lg font-semibold sm:text-xl">
                  Salam, bienvenue
                </p>
              </div>
              <p className="mt-1 text-xs text-white/75">
                Un endroit pour retrouver tes repères, à ton rythme.
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#E8E1EF] bg-[#F8F5FC] p-3 sm:col-span-2">
                <div className="flex items-center gap-2 text-violet-800">
                  <p className="text-xs font-semibold">Horaires de prière</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((prayer) => (
                    <span key={prayer} className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-[#695B7B]">
                      {prayer}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-[#DFEBDD] bg-[#F1F7EF] p-3">
                <p className="text-xs font-semibold text-[#48694C]">
                  Routine du jour
                </p>
                <p className="mt-2 text-[11px] leading-4 text-[#6E806F]">
                  Adhkar du matin et du soir
                </p>
              </div>
              <div className="rounded-xl border border-[#E8E1EF] bg-white p-3 sm:col-span-2">
                <p className="text-xs font-semibold text-violet-800">
                  Journal Al-Qur’an
                </p>
                <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
                  Note ta lecture et retrouve le passage où tu t’es arrêtée.
                </p>
              </div>
              <div className="rounded-xl border border-[#DFEBDD] bg-[#F1F7EF] p-3">
                <p className="text-xs font-semibold text-[#48694C]">
                  Mes repères
                </p>
                <p className="mt-2 text-[11px] leading-4 text-[#6E806F]">
                  Cycle et planning adapté
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="landing-module-strip mt-5 grid grid-cols-2 gap-2 rounded-[24px] border border-white/90 bg-white/75 p-3 shadow-md shadow-violet-200/15 backdrop-blur-sm sm:grid-cols-3 sm:p-4 lg:grid-cols-5">
          {productModules.map(({ label }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className="flex items-center gap-2.5 rounded-2xl px-2 py-2 sm:justify-center sm:gap-3 sm:px-3 sm:py-3"
            >
              <span className="text-xs font-semibold text-foreground sm:text-sm">
                {label}
              </span>
            </motion.div>
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
          className="rounded-[24px] border border-white/80 bg-white/75 p-3 shadow-xl shadow-violet-200/20 backdrop-blur-sm"
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

      <section className="landing-cta mx-5 mb-10 flex flex-col items-center justify-between gap-6 rounded-[34px] border border-white/80 bg-white/55 px-6 py-14 text-center shadow-xl shadow-violet-200/20 backdrop-blur-sm sm:mx-auto sm:max-w-6xl sm:px-10 sm:py-16">
        <div className="flex flex-col items-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Un espace sans culpabilité
          </p>
          <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Le lien ne se mesure pas au nombre de cases cochées.
          </h2>
        </div>
        <button
          type="button"
          onClick={openDashboard}
          className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5"
        >
          Continuer vers mon espace
        </button>
      </section>

      <footer className="border-t border-violet-100 px-5 py-6 text-center text-sm text-muted-foreground">
        nour. · Ton rythme est le bon.
      </footer>
      </main>
    </MotionConfig>
  );
}
