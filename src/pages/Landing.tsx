import { useState } from "react";
import { NourMark } from "@/components/NourMark";
import { adhkarBySession } from "@/convex/adhkarData";
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

const steps = [
  {
    title: "Crée un compte",
    text: "Avec une adresse e-mail ou un compte Google.",
  },
  {
    title: "Active la localisation",
    text: "Les horaires de prière de ta ville s’affichent.",
  },
  {
    title: "Choisis les modules",
    text: "Affiche uniquement les cartes utiles sur l’écran « Aujourd’hui ».",
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
    answer: `Selon ta position, avec les réglages de la ${prayerCalculation.referenceMosque} : Fajr quand le soleil est à ${prayerCalculation.fajrAngle}° sous l’horizon, Isha à ${prayerCalculation.ishaAngle}°, Maghrib ${prayerCalculation.maghribOffsetMinutes} minutes après le coucher du soleil. Si ta mosquée utilise d’autres réglages, un écart de quelques minutes est possible.`,
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
    question: "Faut-il installer l’application ?",
    answer:
      "Non. Nour fonctionne dans le navigateur. Tu peux l’ajouter à l’écran d’accueil du téléphone.",
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
        <a href="/" className="flex items-center gap-2.5" aria-label="Nour, accueil">
          <NourMark className="size-8 text-(--n-sage)" />
          <span className="n-display text-2xl">Nour</span>
        </a>
        <nav className="hidden items-center gap-8 text-[15px] font-medium text-(--n-muted) md:flex">
          <a className="hover:text-(--n-ink)" href="#esprit">Principes</a>
          <a className="hover:text-(--n-ink)" href="#fonctionnalites">Fonctionnalités</a>
          <a className="hover:text-(--n-ink)" href="#faq">Questions</a>
        </nav>
        <a href={authHref} className="n-btn n-btn-ghost px-4! py-2.5! text-sm!">
          Mon espace
        </a>
      </header>

      {/* Héros */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-8 sm:px-8 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-24">
        <div className="n-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-(--n-line) bg-(--n-paper) px-3.5 py-2 text-sm font-semibold text-(--n-sage-dark)">
            <NourMark className="size-4 text-(--n-sage)" />
            Selon le Coran et la Sunna authentique
          </span>
          <h1 className="n-display mt-5 text-[clamp(32px,4vw,42px)] leading-[1.1] tracking-[-0.02em]">
            Adhkar, Coran et <span className="text-(--n-sage)">prières.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-7 text-(--n-muted)">
            Horaires de prière calculés selon ta position. Adhkar du matin et du soir
            avec leurs sources. Lecture et écoute du Coran. Suivi du cycle et du qada.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={authHref} className="n-btn px-6! py-4!">
              Créer mon espace
            </a>
            <a href="#fonctionnalites" className="n-btn n-btn-ghost px-6! py-4!">
              Voir les fonctionnalités
            </a>
          </div>
        </div>

        <div className="n-rise">
          <article className="n-card n-card-dark p-7!" aria-label="Aperçu de la prochaine prière">
            <KhatamPattern id="landing-khatam" />
            <div className="relative flex items-end justify-between gap-4">
              <div>
                <span className="n-label">Prochaine prière</span>
                <p className="n-display mt-3 text-[26px] leading-none">Maghrib</p>
              </div>
              <p className="text-[15px] text-(--n-on-dark-muted)">
                dans <b className="font-semibold text-white">1 h 12</b>
              </p>
            </div>
            <p className="n-display relative text-[clamp(56px,8vw,88px)] leading-[0.95] tabular-nums tracking-[-0.03em]">
              18:52
            </p>
            <div className="n-timeline">
              <div className="n-track">
                <span style={{ width: "62%" }} />
              </div>
              <ol className="n-stops">
                {sampleTimes.map(([name, time], index) => (
                  <li
                    key={name}
                    className="n-stop"
                    data-state={index < 3 ? "done" : index === 3 ? "next" : "upcoming"}
                  >
                    <i className="n-stop-dot" />
                    {name}
                    <span className="n-stop-time">{time}</span>
                  </li>
                ))}
              </ol>
            </div>
          </article>
          <p className="mt-3 text-center text-[13px] text-(--n-muted)">
            Aperçu avec des horaires d’exemple.
          </p>
        </div>
      </section>

      {/* Principes */}
      <section id="esprit" className="border-y border-(--n-line)">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:gap-10">
          {principles.map(({ title, text }) => (
            <div key={title}>
              <h2 className="n-display text-xl">{title}</h2>
              <p className="mt-2 text-[15px] leading-6 text-(--n-muted)">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fonctionnalités : index éditorial, chaque ligne montre un fragment réel de l'interface */}
      <section id="fonctionnalites" className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-24">
        <span className="n-label">Fonctionnalités</span>
        <h2 className="n-section-title mt-4 max-w-3xl">Ce que contient Nour</h2>

        <ol className="n-index mt-12">
          <li className="n-index-row">
            <span className="n-index-num">01</span>
            <div>
              <h3 className="n-index-title">Adhkar du matin et du soir</h3>
              <p className="n-index-text">
                Une invocation à la fois. Un compteur à toucher à chaque récitation. La
                preuve sous chaque texte.
              </p>
            </div>
            <div className="n-index-preview">
              <p className="n-arabic text-[22px] leading-[1.9]" lang="ar">
                {sampleInvocation.arabic}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-(--n-line) pt-3">
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
          </li>

          <li className="n-index-row">
            <span className="n-index-num">02</span>
            <div>
              <h3 className="n-index-title">Coran</h3>
              <p className="n-index-text">
                Sourates à gauche, texte à droite. Touche un verset pour l’écouter. L’écoute
                continue sur les autres pages.
              </p>
            </div>
            <div className="n-index-preview p-2!">
              {sampleSurahs.map(([number, name, verses, arabic], index) => (
                <div key={number} className="n-surah-item" aria-current={index === 1}>
                  <span className="n-surah-num">
                    <NourMark />
                    <span className="relative">{number}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{name}</span>
                    <span className="block text-[13px] text-(--n-muted)">{verses} versets</span>
                  </span>
                  <span className="n-surah-name-ar" lang="ar">
                    {arabic}
                  </span>
                </div>
              ))}
            </div>
          </li>

          <li className="n-index-row">
            <span className="n-index-num">03</span>
            <div>
              <h3 className="n-index-title">Prières et planning</h3>
              <p className="n-index-text">
                Horaires calculés selon ta position. Planning de la journée organisé autour
                des prières.
              </p>
            </div>
            <div className="n-index-preview">
              <ul className="n-topbar-times">
                {sampleTimes.map(([name, time]) => (
                  <li key={name} data-next={name === "Maghrib"}>
                    <span>{name}</span>
                    <b>{time}</b>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[12px] text-(--n-muted)">Horaires d’exemple.</p>
            </div>
          </li>

          <li className="n-index-row">
            <span className="n-index-num">04</span>
            <div>
              <h3 className="n-index-title">Cycle et qada</h3>
              <p className="n-index-text">
                Jours de règles et jeûnes à rattraper. Le mode ‘Udhr masque les prières du
                planning.
              </p>
            </div>
            <div className="n-index-preview">
              <div className="n-week">
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
          </li>

          <li className="n-index-row">
            <span className="n-index-num">05</span>
            <div>
              <h3 className="n-index-title">Science bénéfique</h3>
              <p className="n-index-text">
                Livres à lire, cours suivis et notes de révision.
              </p>
            </div>
            <div className="n-index-preview space-y-2">
              {sampleBooks.map(([title, author, status], index) => (
                <div key={title} className="flex items-center gap-3">
                  <span className="n-book-rank">{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{title}</span>
                    <span className="block text-[13px] text-(--n-muted)">{author}</span>
                  </span>
                  <span className="n-chip">{status}</span>
                </div>
              ))}
            </div>
          </li>
        </ol>
      </section>

      {/* Étapes */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-8 sm:pb-24">
        <span className="n-label">Démarrage</span>
        <h2 className="n-section-title mt-4">Trois étapes</h2>
        <ol className="mt-10 grid gap-8 border-t border-(--n-line) pt-8 md:grid-cols-3">
          {steps.map(({ title, text }, index) => (
            <li key={title}>
              <span className="n-index-num">0{index + 1}</span>
              <h3 className="n-display mt-3 text-xl">{title}</h3>
              <p className="mt-2 text-[15px] leading-6 text-(--n-muted)">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Questions */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />
      <section id="faq" className="mx-auto max-w-3xl px-4 pb-16 sm:px-8 sm:pb-24">
        <span className="n-label">Questions</span>
        <h2 className="n-section-title mt-4">Questions fréquentes</h2>
        <div className="mt-8 border-t border-(--n-line)">
          {faqs.map(({ question, answer }) => (
            <details key={question} className="n-faq">
              <summary>{question}</summary>
              <p className="pt-3 text-[15px] leading-7 text-(--n-muted)">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Appel final */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-8">
        <div className="n-card n-card-dark flex flex-col items-start gap-6 p-8! sm:p-12! lg:flex-row lg:items-center lg:justify-between">
          <KhatamPattern id="landing-khatam-cta" />
          <h2 className="n-section-title relative max-w-2xl">
            Crée ton espace Nour.
          </h2>
          <a
            href={authHref}
            className="n-btn relative shrink-0 bg-(--n-on-dark)! px-6! py-4! text-(--n-sage-dark)!"
          >
            Créer mon espace
          </a>
        </div>
      </section>

      <footer className="border-t border-(--n-line) px-4 py-6 text-center text-sm text-(--n-muted)">
        Nour · Selon le Coran et la Sunna authentique · Sans publicité
      </footer>
    </main>
  );
}
