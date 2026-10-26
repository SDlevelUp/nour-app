import { useState } from "react";
import { NourMark } from "@/components/NourMark";
import { adhkarBySession } from "@/convex/adhkarData";
import { motsDuCoranNonnenmacher } from "@/data/motsDuCoranNonnenmacher";
import { rappels } from "@/data/rappels";
import { prayerCalculation } from "@/hooks/use-prayer-times";

const authHref = "/auth?returnTo=%2Fdashboard";

const principles = [
  {
    title: "Coran et Sunna authentique",
    text: "Contenus tirés du Coran et de hadiths authentiques, selon la compréhension des pieux prédécesseurs.",
  },
  {
    title: "Sources affichées",
    text: "Chaque invocation indique son rapporteur, son recueil, son numéro et son degré d’authenticité.",
  },
  {
    title: "Ni série ni score",
    text: "Aucun compteur de jours consécutifs. Aucun retard à rattraper.",
  },
  {
    title: "Sans publicité",
    text: "Aucune publicité, ni pendant la lecture, ni pendant l’écoute.",
  },
];

// Section « Pour qui et pourquoi » (demande de Sarah du 2026-10-26).
const audiences = [
  {
    title: "Pour la femme musulmane",
    text: "Qui veut prier à l’heure, dire ses adhkar du matin et du soir et garder un lien régulier avec le Coran.",
  },
  {
    title: "Pour l’étudiante en science",
    text: "Qui suit des cours, lit des livres et révise des matn, et veut tout retrouver au même endroit.",
  },
  {
    title: "Pour les jours de règles",
    text: "Qui veut suivre son cycle, compter ses jeûnes à rattraper et adapter son planning.",
  },
];

const benefits = [
  {
    title: "Un seul espace",
    text: "Horaires de prière, adhkar, Coran, cycle, science et notes, sans passer d’une application à l’autre.",
  },
  {
    title: "Des horaires sans réglage",
    text: "Ta position ou ta ville suffit. Les horaires du jour s’affichent chaque matin.",
  },
  {
    title: "Une lecture qui reprend où tu t’es arrêtée",
    text: "La sourate, le verset et le livre en cours restent en tête de ton écran.",
  },
  {
    title: "Un planning adapté aux règles",
    text: "Le mode ‘Udhr masque les prières le temps des règles. Le compteur de qada garde le reste.",
  },
  {
    title: "Tes données sur tous tes appareils",
    text: "Notes, lectures et suivi du cycle sont enregistrés dans ton compte.",
  },
];

const faqs = [
  {
    question: "L’application impose-t-elle une routine ?",
    answer: "Non. Aucun objectif quotidien, aucune série, aucun score.",
  },
  {
    question: "D’où viennent les invocations ?",
    answer:
      "Des recueils de hadiths. Chaque invocation indique le rapporteur, le recueil, le numéro et le degré d’authenticité publiés par sunnah.com.",
  },
  {
    question: "Comment sont calculés les horaires de prière ?",
    answer: `Automatiquement, selon ta position : autorise la localisation une fois, les horaires de ta ville s’affichent chaque jour. Calcul : Fajr et Isha quand le soleil est à ${prayerCalculation.fajrAngle}° sous l’horizon, Maghrib ${prayerCalculation.maghribOffsetMinutes} minutes après le coucher du soleil. Un écart de quelques minutes avec ta mosquée est possible.`,
  },
  {
    question: "Puis-je faire une pause pendant mes règles ?",
    answer:
      "Oui. Le mode ‘Udhr masque les créneaux de prière du planning. Le suivi du cycle enregistre les jours de règles.",
  },
  {
    question: "Où sont enregistrées mes données ?",
    answer:
      "Notes, lectures et suivi du cycle sont enregistrés dans ton compte et disponibles sur tous tes appareils. La position reste sur l’appareil et sert uniquement au calcul des horaires.",
  },
  {
    question: "Rawdah est-elle adaptée aux femmes musulmanes ?",
    answer:
      "Oui. Rawdah inclut le suivi du cycle, le compteur de jours de jeûne à rattraper (qada) et le mode ‘Udhr, qui masque les prières du planning pendant les règles.",
  },
  {
    question: "Quels adhkar contient Rawdah ?",
    answer: `${adhkarBySession.morning.length} invocations le matin et ${adhkarBySession.evening.length} le soir, dont la demande de pardon maîtresse (Sayyid al-istighfar), al-Ikhlas, al-Falaq et an-Nas. Chaque invocation affiche son rapporteur, son recueil, son numéro et son degré d’authenticité.`,
  },
  {
    question: "Peut-on écouter le Coran dans Rawdah ?",
    answer:
      "Oui. Les 114 sourates se lisent et s’écoutent verset par verset, avec plusieurs récitateurs. La phonétique et la traduction française s’affichent sous chaque verset. L’écoute continue quand tu changes de page.",
  },
  {
    question: "Faut-il installer l’application ?",
    answer:
      "Non. Rawdah fonctionne dans le navigateur. Tu peux l’ajouter à l’écran d’accueil du téléphone.",
  },
];

// Données structurées FAQ (schema.org), générées depuis la même liste que la FAQ affichée.
const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
}).replace(/</g, "\\u003c");

// Aperçu illustratif : horaires d'exemple, signalés comme tels sous la carte.
const sampleTimes = [
  ["Fajr", "06:31"],
  ["Dhuhr", "13:43"],
  ["Asr", "16:31"],
  ["Maghrib", "18:52"],
  ["Isha", "20:24"],
] as const;

const sampleInvocation = adhkarBySession.morning[0];
const sampleWord = motsDuCoranNonnenmacher[0];
const sampleRappel = rappels[0];

// Fragments d'interface pour l'index des fonctionnalités (données d'illustration).
const sampleSurahs = [
  [1, "Al-Faatiha", 7, "الفاتحة"],
  [2, "Al-Baqara", 286, "البقرة"],
  [3, "Aal-i-Imraan", 200, "آل عمران"],
] as const;

const sampleWeek = [
  ["lun", 13, "period"],
  ["mar", 14, "period"],
  ["mer", 15, "period"],
  ["jeu", 16, "today"],
  ["ven", 17, ""],
  ["sam", 18, ""],
  ["dim", 19, ""],
] as const;

const sampleBooks = [
  ["Al-Arba‘in an-Nawawiyya", "an-Nawawi", "En cours"],
  ["Riyad as-Salihin", "an-Nawawi", "À lire"],
] as const;

function KhatamPattern({ id }: { id: string }) {
  return (
    <svg className="n-pattern" aria-hidden="true">
      <defs>
        <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
          <rect x="8" y="8" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <rect
            x="8"
            y="8"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            transform="rotate(45 20 20)"
          />
          <circle cx="0" cy="0" r="2.5" fill="none" stroke="currentColor" />
          <circle cx="40" cy="40" r="2.5" fill="none" stroke="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

export default function Landing() {
  const [isDarkMode] = useState(() => {
    try {
      return localStorage.getItem("nour-dark-mode") === "true";
    } catch {
      return false;
    }
  });

  return (
    <main className={`n-landing ${isDarkMode ? "n-landing-dark" : ""}`}>
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-8">
        <a href="/" className="flex items-center gap-2.5" aria-label="Rawdah, accueil">
          <NourMark className="size-8 text-(--n-sage)" />
          <span className="n-display text-2xl">Rawdah</span>
        </a>
        <nav className="hidden items-center gap-8 text-[15px] font-medium text-(--n-muted) md:flex">
          <a className="hover:text-(--n-ink)" href="#fonctionnalites">Fonctionnalités</a>
          <a className="hover:text-(--n-ink)" href="#pour-qui">Pour qui</a>
          <a className="hover:text-(--n-ink)" href="#faq">Questions</a>
        </nav>
        <a href={authHref} className="n-btn n-btn-ghost px-4! py-2.5! text-sm!">
          Mon espace
        </a>
      </header>

      {/* Héros centré, maquette de téléphone et étiquettes flottantes */}
      <section className="mx-auto max-w-6xl px-4 pt-10 text-center sm:px-8 sm:pt-16">
        <div className="n-rise mx-auto max-w-2xl">
          <span className="n-label justify-center">Application musulmane pour les femmes</span>
          <h1 className="n-display mt-5 text-[clamp(32px,4vw,42px)] leading-[1.1] tracking-[-0.02em]">
            Adhkar, Coran et <span className="text-(--n-sage)">prières.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-7 text-(--n-muted)">
            Horaires de prière calculés selon ta position. Adhkar du matin et du soir avec
            leurs sources. Lecture et écoute du Coran. Suivi du cycle et du qada. Un rappel
            des pieux prédécesseurs chaque jour.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={authHref} className="n-btn px-6! py-4!">
              Créer mon espace
            </a>
            <a href="#fonctionnalites" className="n-btn n-btn-ghost px-6! py-4!">
              Voir les fonctionnalités
            </a>
          </div>
        </div>

        <div className="n-hero-stage n-rise" aria-label="Aperçu de l’écran Aujourd’hui">
          <span className="n-float" style={{ left: "6%", top: "18%" }}>
            <b>Fajr</b> 06:31
          </span>
          <span className="n-float" style={{ right: "5%", top: "12%" }}>
            Rappel du jour
          </span>
          <span className="n-float" style={{ left: "10%", bottom: "20%" }}>
            Sourate Yunus · verset 4
          </span>
          <span className="n-float n-float-mauve" style={{ right: "8%", bottom: "26%" }}>
            Mode ‘Udhr
          </span>

          <div className="n-phone">
            <div className="n-phone-screen">
              <p className="n-arabic text-[13px] text-(--n-sage)" lang="ar" dir="rtl">
                السَّلَامُ عَلَيْكُمْ
              </p>
              <p className="n-display text-left text-[15px]">As-salâmu ʿalaykum</p>
              <div className="n-phone-prayer">
                <KhatamPattern id="landing-khatam" />
                <span className="relative block text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-(--n-on-dark-muted)">
                  Prochaine prière
                </span>
                <span className="relative flex items-end justify-between">
                  <b className="n-display text-[36px] leading-none">18:52</b>
                  <span className="text-[12px] text-(--n-on-dark-muted)">Maghrib</span>
                </span>
                <span className="relative mt-3 flex justify-between text-[9px] text-(--n-on-dark-muted)">
                  {sampleTimes.map(([name, time]) => (
                    <span key={name} className={name === "Maghrib" ? "font-bold text-white" : ""}>
                      {name}
                      <br />
                      {time}
                    </span>
                  ))}
                </span>
              </div>
              <div className="n-phone-card text-left">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-(--n-muted)">
                  Adhkar du matin
                </span>
                <p className="n-arabic mt-1 text-[14px] leading-[1.8]" lang="ar">
                  {sampleInvocation.arabic}
                </p>
              </div>
              <div className="n-phone-card n-phone-tint text-left">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-(--n-muted)">
                  Reprendre la lecture du Coran
                </span>
                <p className="n-display mt-1 text-[14px]">Yunus · verset 4</p>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-[13px] text-(--n-muted)">Aperçu avec des données d’exemple.</p>
      </section>

      {/* Principes, en bandeau */}
      <section id="esprit" className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
        <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
          {principles.map(({ title, text }) => (
            <div key={title}>
              <h2 className="n-display text-[17px]">{title}</h2>
              <p className="mx-auto mt-2 max-w-[26ch] text-[14px] leading-6 text-(--n-muted)">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section alternée 1 : adhkar */}
      <section id="fonctionnalites" className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="n-split">
          <div className="n-split-visual">
            <div className="n-showcase">
              <div className="flex items-center justify-between">
                <span className="n-label">Adhkar du matin</span>
                <span className="n-chip">1 sur {adhkarBySession.morning.length}</span>
              </div>
              <p className="n-arabic mt-4 text-[24px] leading-[1.9]" lang="ar">
                {sampleInvocation.arabic}
              </p>
              <p className="mt-3 text-[14px] italic text-(--n-sage)">{sampleInvocation.transliteration}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-[12px] text-(--n-muted)">
                  {sampleInvocation.proof.sources.map((source, index) => (
                    <span key={`${source.collection}-${source.number}`}>
                      {index > 0 && " · "}
                      <b className="font-semibold text-(--n-ink)">
                        {source.collection} {source.number}
                      </b>
                    </span>
                  ))}
                </p>
                <span className="n-mini-ring" aria-hidden="true">
                  1<small>/{sampleInvocation.repetitions}</small>
                </span>
              </div>
            </div>
          </div>
          <div className="n-split-text">
            <span className="n-label">Adhkar</span>
            <h2 className="n-section-title mt-4">Les adhkar du matin et du soir, avec leurs preuves</h2>
            <p className="mt-4 text-[16px] leading-7 text-(--n-muted)">
              Dhikr et invocations tirés de Sahih al-Bukhari, Sahih Muslim et des recueils de
              hadiths authentifiés. Une invocation à la fois. Un compteur à toucher à chaque
              récitation. Le rapporteur, le recueil, le numéro et le degré d’authenticité sous
              chaque texte.
            </p>
          </div>
        </div>
      </section>

      {/* Section alternée 2 : rappels */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="n-split n-split-reverse">
          <div className="n-split-text">
            <span className="n-label">Rappels</span>
            <h2 className="n-section-title mt-4">Deux rappels par jour, rien de plus</h2>
            <p className="mt-4 text-[16px] leading-7 text-(--n-muted)">
              Un rappel le matin, un le soir, à l’heure que tu choisis. Une parole des pieux
              prédécesseurs sur ton écran chaque jour, avec son auteur et sa source.
            </p>
          </div>
          <div className="n-split-visual">
            <div className="n-notif-stack">
              <div className="n-notif">
                <NourMark className="size-8 shrink-0 text-(--n-sage)" />
                <span className="min-w-0 text-left">
                  <b className="block text-[14px]">Adhkar du matin</b>
                  <span className="block text-[13px] text-(--n-muted)">
                    Ouvre Rawdah pour réciter les adhkar.
                  </span>
                </span>
                <span className="ml-auto text-[12px] text-(--n-muted)">07:00</span>
              </div>
              <div className="n-notif">
                <NourMark className="size-8 shrink-0 text-(--n-sage)" />
                <span className="min-w-0 text-left">
                  <b className="block text-[14px]">Adhkar du soir</b>
                  <span className="block text-[13px] text-(--n-muted)">
                    Ouvre Rawdah pour réciter les adhkar.
                  </span>
                </span>
                <span className="ml-auto text-[12px] text-(--n-muted)">18:30</span>
              </div>
              <div className="n-notif n-notif-quote">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-(--n-mauve-text)">
                  Rappel du jour
                </span>
                <p className="mt-2 text-left text-[14px] leading-6">
                  « {sampleRappel.text.length > 90 ? `${sampleRappel.text.slice(0, 90).trimEnd()}…` : sampleRappel.text} »
                </p>
                <p className="mt-2 text-left text-[12px] text-(--n-muted)">
                  {sampleRappel.author} · {sampleRappel.source}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grille des détails */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="n-label justify-center">Fonctionnalités</span>
          <h2 className="n-section-title mt-4">Ce que contient Rawdah</h2>
        </div>
        <div className="n-bento mt-10">
          <article className="n-bento-card">
            <div className="n-bento-visual p-2!">
              {sampleSurahs.map(([number, name, verses, arabic], index) => (
                <div key={number} className="n-surah-item" aria-current={index === 1}>
                  <span className="n-surah-num">
                    <NourMark />
                    <span className="relative">{number}</span>
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block truncate font-semibold">{name}</span>
                    <span className="block text-[13px] text-(--n-muted)">{verses} versets</span>
                  </span>
                  <span className="n-surah-name-ar" lang="ar">
                    {arabic}
                  </span>
                </div>
              ))}
            </div>
            <h3 className="n-display mt-5 text-[18px]">Coran</h3>
            <p className="mt-1 text-[14px] leading-6 text-(--n-muted)">
              Les 114 sourates, verset par verset, en arabe avec phonétique et traduction
              française. Plusieurs récitateurs.
            </p>
          </article>

          <article className="n-bento-card">
            <div className="n-bento-visual">
              <div className="n-mini-demo">
                <span className="n-surah-num">
                  <NourMark />
                  <span className="relative">10</span>
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <b className="block text-[14px]">Yunus</b>
                  <span className="block text-[12px] text-(--n-muted)">Verset 4 / 109</span>
                </span>
                <span className="n-mini-demo-play" aria-hidden="true">❚❚</span>
              </div>
            </div>
            <h3 className="n-display mt-5 text-[18px]">L’écoute continue</h3>
            <p className="mt-1 text-[14px] leading-6 text-(--n-muted)">
              Change de page : une petite fenêtre garde la récitation, avec verset et sourate
              suivants.
            </p>
          </article>

          <article className="n-bento-card">
            <div className="n-bento-visual">
              <p className="n-arabic text-center text-[34px] leading-[1.5] text-(--n-sage-dark)" lang="ar">
                {sampleWord.arabic}
              </p>
              <p className="mt-1 text-[14px] font-semibold">
                {sampleWord.translation.replace(/[\s,.;:!»]+$/u, "")}
              </p>
            </div>
            <h3 className="n-display mt-5 text-[18px]">Un mot du Coran par jour</h3>
            <p className="mt-1 text-[14px] leading-6 text-(--n-muted)">
              Le mot, sa traduction et son verset, d’après la traduction mot à mot du Dr Usama
              Nonnenmacher.
            </p>
          </article>

          <article className="n-bento-card">
            <div className="n-bento-visual">
              <div className="n-week n-week-compact">
                {sampleWeek.map(([day, date, state]) => (
                  <span
                    key={day}
                    className="n-day"
                    data-period={state === "period"}
                    data-today={state === "today"}
                  >
                    {day}
                    <b>{date}</b>
                  </span>
                ))}
              </div>
            </div>
            <h3 className="n-display mt-5 text-[18px]">Cycle et qada</h3>
            <p className="mt-1 text-[14px] leading-6 text-(--n-muted)">
              Suivi des règles, estimation des prochaines règles, jeûnes à rattraper. Le mode
              ‘Udhr masque les prières du planning.
            </p>
          </article>

          <article className="n-bento-card">
            <div className="n-bento-visual">
              <ul className="n-topbar-times justify-center">
                {sampleTimes.map(([name, time]) => (
                  <li key={name} data-next={name === "Maghrib"}>
                    <span>{name}</span>
                    <b>{time}</b>
                  </li>
                ))}
              </ul>
            </div>
            <h3 className="n-display mt-5 text-[18px]">Horaires de prière et mosquées</h3>
            <p className="mt-1 text-[14px] leading-6 text-(--n-muted)">
              Horaires de Fajr à Isha selon ta position ou ta ville. Mosquées proches avec
              l’itinéraire.
            </p>
          </article>

          <article className="n-bento-card">
            <div className="n-bento-visual space-y-2">
              {sampleBooks.map(([title, author, status], index) => (
                <div key={title} className="flex items-center gap-3 text-left">
                  <span className="n-book-rank">{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{title}</span>
                    <span className="block text-[13px] text-(--n-muted)">{author}</span>
                  </span>
                  <span className="n-chip">{status}</span>
                </div>
              ))}
            </div>
            <h3 className="n-display mt-5 text-[18px]">Science bénéfique</h3>
            <p className="mt-1 text-[14px] leading-6 text-(--n-muted)">
              Livres à lire, cours suivis, notes de révision et matn à mémoriser par portions.
            </p>
          </article>
        </div>
      </section>

      {/* Pour qui */}
      <section id="pour-qui" className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="n-label justify-center">Pour qui</span>
          <h2 className="n-section-title mt-4">Pensée pour les femmes musulmanes</h2>
        </div>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {audiences.map(({ title, text }) => (
            <li key={title} className="n-audience">
              <h3 className="n-display text-[18px]">{title}</h3>
              <p className="mt-1 text-[15px] leading-6 text-(--n-muted)">{text}</p>
            </li>
          ))}
        </ul>
        <ol className="mt-10 grid gap-x-10 gap-y-6 md:grid-cols-2">
          {benefits.map(({ title, text }, index) => (
            <li key={title} className="grid grid-cols-[40px_minmax(0,1fr)] gap-3">
              <span className="n-index-num pt-0.5">0{index + 1}</span>
              <div>
                <h3 className="n-display text-[17px]">{title}</h3>
                <p className="mt-1 text-[15px] leading-6 text-(--n-muted)">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Questions, en deux colonnes */}
      <section id="faq" className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <span className="n-label">Questions</span>
            <h2 className="n-section-title mt-4">Questions fréquentes</h2>
            <p className="mt-4 max-w-sm text-[15px] leading-6 text-(--n-muted)">
              Création du compte, horaires, sources des invocations, données : l’essentiel avant
              de commencer.
            </p>
            <a href={authHref} className="n-btn n-btn-sage mt-6 px-5! py-3!">
              Créer mon espace
            </a>
          </div>
          <div className="space-y-2">
            {faqs.map(({ question, answer }) => (
              <details key={question} className="n-faq">
                <summary>{question}</summary>
                <p className="pt-3 text-[15px] leading-7 text-(--n-muted)">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Appel final */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-8">
        <div className="n-card n-card-dark flex flex-col items-start gap-6 p-8! sm:p-12! lg:flex-row lg:items-center lg:justify-between">
          <KhatamPattern id="landing-khatam-cta" />
          <h2 className="n-section-title relative max-w-2xl">Crée ton espace Rawdah.</h2>
          <a
            href={authHref}
            className="n-btn relative shrink-0 bg-(--n-on-dark)! px-6! py-4! text-(--n-sage-dark)!"
          >
            Créer mon espace
          </a>
        </div>
      </section>

      <footer className="n-footer">
        <p className="relative z-10 text-sm text-(--n-muted)">
          Rawdah · Selon le Coran et la Sunna authentique · Sans publicité
        </p>
        <span className="n-footer-mark" aria-hidden="true">
          Rawdah
        </span>
      </footer>
    </main>
  );
}
