import { NourMark } from "@/components/NourMark";
import { adhkarBySession } from "@/convex/adhkarData";
import { prayerCalculation } from "@/hooks/use-prayer-times";

const authHref = "/auth?returnTo=%2Fdashboard";

const principles = [
  {
    title: "Coran et Sunna authentique",
    text: "Selon la compréhension des pieux prédécesseurs.",
  },
  {
    title: "Chaque source affichée",
    text: "Rapporteur, recueil, numéro et degré d’authenticité.",
  },
  {
    title: "Ni série, ni score",
    text: "Aucun compteur de jours, aucun retard à rattraper.",
  },
  {
    title: "Zéro publicité",
    text: "Ni pendant la lecture, ni pendant l’écoute.",
  },
];

const profiles = [
  {
    title: "Tu veux prier à l’heure",
    text: "Dire tes adhkar du matin et du soir, et garder un lien régulier avec le Coran.",
  },
  {
    title: "Tu étudies la science",
    text: "Tes livres, tes cours, tes notes de révision et tes matn, enfin au même endroit.",
  },
  {
    title: "Tu es en période de règles",
    text: "Le mode ‘Udhr masque les prières de ton planning. Ton compteur de qada, lui, continue.",
  },
];

const steps = [
  { title: "Crée ton compte", text: "Avec ton e-mail ou ton compte Google." },
  { title: "Active la localisation", text: "Les horaires de ta ville s’affichent tout seuls." },
  { title: "Choisis tes modules", text: "Seulement les cartes utiles sur « Aujourd’hui »." },
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

// Aperçus : données d'exemple, signalées comme telles sur la page.
const sampleTimes = [
  ["Fajr", "06:31"],
  ["Dhuhr", "13:43"],
  ["Asr", "16:31"],
  ["Maghrib", "18:52"],
  ["Isha", "20:24"],
] as const;

const sampleInvocation = adhkarBySession.morning[0];
const sampleSource = sampleInvocation.proof.sources[0];
const sampleGrade =
  sampleSource.grades.find((grade) => grade.by === "al-Albani") ?? sampleSource.grades[0];

const sampleSurahs = [
  { name: "Al-Faatiha", detail: "7 versets", arabic: "الفاتحة", active: false },
  { name: "Al-Baqara", detail: "286 versets · en écoute", arabic: "البقرة", active: true },
  { name: "Aal-i-Imraan", detail: "200 versets", arabic: "آل عمران", active: false },
];

const sampleWeek = [
  ["lun", 13, "period"],
  ["mar", 14, "period"],
  ["mer", 15, "period"],
  ["jeu", 16, "today"],
  ["ven", 17, ""],
  ["sam", 18, ""],
  ["dim", 19, ""],
] as const;

// Motif décoratif : étoile à 8 branches (deux carrés, dont un tourné à 45°).
function StarPattern() {
  return (
    <svg className="rw-hero-pattern" aria-hidden="true">
      <defs>
        <pattern id="rw-stars" width="56" height="56" patternUnits="userSpaceOnUse">
          <rect x="16" y="16" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1" />
          <rect
            x="16"
            y="16"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            transform="rotate(45 28 28)"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#rw-stars)" />
    </svg>
  );
}

export default function Landing() {
  return (
    <main className="rw">
      <div className="px-4">
        <nav className="rw-nav" aria-label="Navigation principale">
          <a href="/" className="rw-logo" aria-label="Rawdah, accueil">
            <NourMark className="size-7 text-(--rw-green)" />
            Rawdah
          </a>
          <div className="rw-nav-links">
            <a href="#principes">Principes</a>
            <a href="#fonctionnalites">Fonctionnalités</a>
            <a href="#faq">Questions</a>
          </div>
          <a href={authHref} className="rw-btn rw-btn-ink">
            Mon espace
          </a>
        </nav>
      </div>

      {/* Héros */}
      <section className="rw-hero">
        <div className="rw-hero-bg" aria-hidden="true">
          <StarPattern />
        </div>
        <div className="rw-hero-inner rw-wrap">
          <h1 className="rw-title">
            Ta journée, rythmée par
            <span className="rw-hero-accent">le dhikr et la prière</span>
          </h1>
          <p className="rw-lead rw-hero-sub">
            Horaires de prière selon ta position, adhkar du matin et du soir avec leurs sources,
            Coran, suivi du cycle et du qada. Une appli pensée pour les femmes, sans pub ni score.
          </p>
          <div className="rw-hero-cta">
            <a href={authHref} className="rw-btn rw-btn-primary">
              Créer mon espace
            </a>
            <a href="#fonctionnalites" className="rw-btn rw-btn-outline">
              Voir l’appli
            </a>
          </div>

          <div className="rw-stage">
            <span className="rw-pill rw-pill-dark" style={{ left: 0, top: "26%" }}>
              Maghrib dans 1 h 12
            </span>
            <span className="rw-pill rw-pill-white" style={{ right: 0, top: "40%" }}>
              Al-Kahf · verset 12
            </span>
            <span className="rw-pill rw-pill-green" style={{ left: "6%", top: "62%" }}>
              Qada : 3 jours restants
            </span>

            <div className="rw-phone" role="img" aria-label="Aperçu de l’écran Aujourd’hui, avec des données d’exemple">
              <span className="rw-phone-notch" aria-hidden="true" />
              <div className="rw-phone-screen" aria-hidden="true">
                <div>
                  <p className="text-[11px] text-(--rw-muted)">Exemple</p>
                  <p className="text-[18px] font-extrabold tracking-[-0.03em]">Aujourd’hui</p>
                </div>
                <div className="rw-phone-card rw-phone-prayer">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-80">
                    Prochaine prière
                  </p>
                  <div className="mt-1 flex items-end justify-between">
                    <div>
                      <p className="text-[13px] font-bold">Maghrib</p>
                      <p className="text-[30px] font-extrabold leading-none tracking-[-0.04em]">18:52</p>
                    </div>
                    <p className="text-[11px] opacity-80">dans 1 h 12</p>
                  </div>
                  <div className="rw-phone-times">
                    {sampleTimes.map(([name, time]) => (
                      <span key={name} className={name === "Maghrib" ? "is-next" : ""}>
                        {name}
                        <b>{time}</b>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rw-phone-card">
                  <p className="text-[10px] font-bold text-(--rw-muted)">
                    Adhkar du matin · 1 sur {adhkarBySession.morning.length}
                  </p>
                  <p className="rw-ar mt-1 line-clamp-2 text-[15px] leading-[1.8]" dir="rtl" lang="ar">
                    {sampleInvocation.arabic}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-(--rw-muted)">
                      {sampleSource.collection} {sampleSource.number}
                    </span>
                    <span className="rw-counter min-h-9! min-w-9! text-[11px]!">0/1</span>
                  </div>
                </div>
                <div className="rw-phone-card bg-(--rw-green-soft)!">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-bold">Al-Kahf</p>
                      <p className="text-[10px] text-(--rw-muted)">Reprendre au verset 12</p>
                    </div>
                    <span className="rw-ar text-[18px] text-(--rw-green)" dir="rtl" lang="ar">
                      الكهف
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principes */}
      <section id="principes" className="rw-principles">
        <div className="rw-wrap rw-principles-grid">
          {principles.map(({ title, text }) => (
            <div key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pour qui */}
      <section className="rw-section">
        <div className="rw-wrap rw-forwho">
          <h2 className="rw-title rw-h2">
            Pensée pour <em>toi</em>, quelle que soit ta journée.
          </h2>
          <div>
            {profiles.map(({ title, text }) => (
              <div key={title} className="rw-forwho-row">
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="rw-section pt-0!">
        <div className="rw-wrap">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="rw-title rw-h2">
              Tout ce qu’il te faut, <em>rien de plus</em>
            </h2>
            <p className="rw-lead mt-4">
              Prière, adhkar, Coran, cycle et science. Tu choisis les modules qui s’affichent sur
              ton écran « Aujourd’hui ».
            </p>
          </div>

          <div className="rw-bento">
            <article className="rw-b rw-b-adhkar">
              <h3>Adhkar du matin et du soir</h3>
              <p>
                Tirés de Sahih al-Bukhari, Sahih Muslim et des recueils authentifiés. Un compteur à
                toucher, la preuve sous chaque texte.
              </p>
              <div className="rw-b-visual rw-adhkar-box">
                <p className="rw-ar" dir="rtl" lang="ar">
                  {sampleInvocation.arabic}
                </p>
                <div className="rw-adhkar-foot">
                  <span>
                    {sampleSource.collection} {sampleSource.number} · {sampleGrade.grade}
                  </span>
                  <span className="rw-counter" aria-hidden="true">
                    1/1
                  </span>
                </div>
              </div>
            </article>

            <article className="rw-b rw-b-coran">
              <h3>Le Coran, verset par verset</h3>
              <p>114 sourates en arabe, phonétique et français. Plusieurs récitateurs, écoute continue.</p>
              <div className="rw-b-visual">
                {sampleSurahs.map((surah) => (
                  <div key={surah.name} className={`rw-surah ${surah.active ? "is-active" : ""}`}>
                    <span>
                      <b className="text-[14px]">{surah.name}</b>
                      <small>{surah.detail}</small>
                    </span>
                    <span className="rw-ar" dir="rtl" lang="ar">
                      {surah.arabic}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rw-b rw-b-prieres">
              <h3>Prières et planning</h3>
              <p>Horaires calculés selon ta position, ta journée organisée autour.</p>
              <div className="rw-b-visual rw-chips">
                {sampleTimes.map(([name, time]) => (
                  <span key={name} className={`rw-chip ${name === "Maghrib" ? "is-next" : ""}`}>
                    <span>{name}</span>
                    {time}
                  </span>
                ))}
              </div>
            </article>

            <article className="rw-b rw-b-cycle">
              <h3>Cycle et qada</h3>
              <p>Suivi des règles, prochaines dates estimées, jeûnes à rattraper.</p>
              <div className="rw-b-visual rw-days">
                {sampleWeek.map(([day, date, state]) => (
                  <span
                    key={day}
                    className={`rw-day ${state === "period" ? "is-period" : ""} ${state === "today" ? "is-today" : ""}`}
                  >
                    {day}
                    <b>{date}</b>
                  </span>
                ))}
              </div>
            </article>

            <article className="rw-b rw-b-science">
              <h3>Science bénéfique</h3>
              <p>Livres, cours, notes de révision et matn à mémoriser par portions.</p>
              <div className="rw-b-visual">
                <div className="rw-book">
                  Al-Arba‘in an-Nawawiyya
                  <span className="rw-tag rw-tag-dark">En cours</span>
                </div>
                <div className="rw-book">
                  Riyad as-Salihin
                  <span className="rw-tag rw-tag-light">À lire</span>
                </div>
              </div>
            </article>
          </div>
          <p className="mt-4 text-center text-[13px] text-(--rw-muted)">Aperçus avec des données d’exemple.</p>
        </div>
      </section>

      {/* Démarrage */}
      <section className="rw-section pt-0!">
        <div className="rw-wrap">
          <div className="rw-start">
            <h2 className="rw-title text-[34px]">
              Prête en <em>deux minutes</em>
            </h2>
            {steps.map(({ title, text }) => (
              <div key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Questions */}
      <section id="faq" className="rw-section pt-0!">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />
        <div className="rw-wrap rw-faq">
          <div>
            <h2 className="rw-title rw-h2">
              Tes <em>questions</em>
            </h2>
            <p className="rw-lead mt-4 max-w-sm">L’essentiel avant de commencer.</p>
          </div>
          <div>
            {faqs.map(({ question, answer }) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Appel final et nom géant */}
      <footer className="rw-footer">
        <div className="rw-wrap">
          <p className="rw-ar" dir="rtl" lang="ar">
            رَوْضَة
          </p>
          <h2 className="rw-title rw-footer-title">
            Ton jardin de <em>rappels</em>, chaque jour.
          </h2>
          <a href={authHref} className="rw-btn rw-btn-ivory mt-8">
            Créer mon espace
          </a>
        </div>
        <span className="rw-wordmark" aria-hidden="true">
          Rawdah
        </span>
        <div className="rw-footer-bar">
          <div className="rw-wrap flex w-full flex-wrap justify-between gap-2">
            <span>Selon le Coran et la Sunna authentique · Sans publicité</span>
            <span>© Rawdah</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
