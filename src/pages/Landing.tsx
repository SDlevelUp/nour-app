import { adhkarBySession } from "@/convex/adhkarData";
import { rappels } from "@/data/rappels";
import { prayerCalculation } from "@/hooks/use-prayer-times";

const authHref = "/auth?returnTo=%2Fdashboard";

const principles = [
  {
    title: "Coran et Sunna authentique",
    text: "Selon la compréhension des pieux prédécesseurs.",
  },
  {
    title: "Chaque source affichée",
    text: "Rapporteur, recueil, numéro et degré d’authenticité sous chaque invocation.",
  },
  {
    title: "Ni série, ni score",
    text: "Aucun compteur de jours consécutifs, aucun retard à rattraper.",
  },
  {
    title: "Zéro publicité",
    text: "Ni pendant la lecture, ni pendant l’écoute.",
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

// Horaires d'exemple (signalés comme tels sur la page).
const sampleTimes = [
  ["Fajr", "06:31"],
  ["Dhuhr", "13:43"],
  ["Asr", "16:31"],
  ["Maghrib", "18:52"],
  ["Isha", "20:24"],
] as const;
const timeOf = (name: (typeof sampleTimes)[number][0]) =>
  sampleTimes.find(([prayer]) => prayer === name)?.[1] ?? "";

// Fajr : invocation du matin, lue dans les données de l'app.
const morningIndex = Math.max(
  adhkarBySession.morning.findIndex((item) => item.id === "morning-sovereignty"),
  0,
);
const morningInvocation = adhkarBySession.morning[morningIndex];
const morningSource = morningInvocation.proof.sources[0];

// Maghrib : invocation du soir et sa preuve, lues dans les données de l'app.
const eveningInvocation = adhkarBySession.evening[0];
const eveningSource = eveningInvocation.proof.sources[0];
const eveningGrade =
  eveningSource.grades.find((grade) => grade.by === "al-Albani") ?? eveningSource.grades[0];

// Asr : al-Kahf (18:10), texte et traduction mot à mot du Dr Usama Nonnenmacher
// (https://github.com/DrUsamaN/CoranMot), repris sans modification.
// Al-Kahf 18:10 récité par Saoud al-Shuraim (choix de Sarah, 2026-10-27) ; même source que le lecteur de l’app (alquran.cloud).
const kahfAudio = "https://cdn.islamic.network/quran/audio/64/ar.saoodshuraym/2150.mp3";

const kahfVerse = {
  arabic:
    "إِذۡ أَوَى ٱلۡفِتۡيَةُ إِلَى ٱلۡكَهۡفِ فَقَالُواْ رَبَّنَآ ءَاتِنَا مِن لَّدُنكَ رَحۡمَةٗ وَهَيِّئۡ لَنَا مِنۡ أَمۡرِنَا رَشَدٗا",
  translation:
    "Quand se sont réfugiés les jeunes gens vers la grotte et ont ensuite dit : « Notre Maître ! Donne-nous de Ta part de la miséricorde et facilite pour nous de notre affaire de la bonne guidance.",
};

const sampleWeek = [
  ["lun", 13, "period"],
  ["mar", 14, "period"],
  ["mer", 15, "period"],
  ["jeu", 16, "today"],
  ["ven", 17, ""],
  ["sam", 18, ""],
  ["dim", 19, ""],
] as const;

export default function Landing() {
  return (
    <main className="rw">
      {/* Fajr : l'aube */}
      <section className="rw-moment rw-fajr rw-hero">
        <header className="rw-wrap rw-header relative z-10">
          {/* Menu mobile en HTML seul (<details>) : la page publique est prérendue sans JavaScript. */}
          <details className="rw-menu">
            <summary aria-label="Ouvrir le menu">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </summary>
            <nav aria-label="Menu">
              <a href="#journee">La journée</a>
              <a href="#sources">Nos sources</a>
              <a href="#faq">Questions</a>
              <a href={authHref}>Mon espace</a>
            </nav>
          </details>
          <a href="/" className="rw-logo" aria-label="Rawdah, accueil">
            Rawdah
          </a>
          <nav className="rw-nav" aria-label="Navigation principale">
            <a href="#journee">La journée</a>
            <a href="#sources">Nos sources</a>
            <a href="#faq">Questions</a>
          </nav>
          <a href={authHref} className="rw-btn rw-btn-dark rw-btn-small">
            Mon espace
          </a>
        </header>

        <div className="rw-wrap rw-moment-grid rw-hero-grid">
          <div className="relative z-10">
            <p className="rw-time-label">Fajr · {timeOf("Fajr")}</p>
            <h1>
              Ta journée
              <br />
              commence ici.
            </h1>
            <p className="rw-text">
              Rawdah est une application musulmane pour les femmes : tes prières, tes adhkar, ton
              Coran et ton cycle, du Fajr au Icha, dans un espace calme.
            </p>
            <p className="rw-signature">Une routine douce, à ton rythme.</p>
            <div className="rw-cta">
              <a href={authHref} className="rw-btn rw-btn-dark">
                Créer mon espace
              </a>
              <a href="#journee" className="rw-btn rw-btn-ghost">
                Suivre la journée
              </a>
            </div>
          </div>

          <div className="rw-moment-visual rw-phone-stage relative z-10">
            <span className="rw-ar rw-hero-callig" aria-hidden="true">
              رَوْضَة
            </span>
            <div className="rw-phone" role="img" aria-label="Exemple : l’écran Aujourd’hui de Rawdah sur téléphone">
              <div className="rw-phone-island" />
              <div className="rw-phone-status" aria-hidden="true">
                <b>11:33</b>
              </div>
              <div className="rw-phone-screen" aria-hidden="true">
                <div className="rw-phone-top">
                  <b>Rawdah</b>
                  <span className="flex gap-1.5">
                    <i className="rw-phone-icon" />
                    <i className="rw-phone-icon rw-phone-avatar" />
                  </span>
                </div>
                <p className="rw-ar rw-phone-salam" dir="rtl" lang="ar">
                  السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ
                </p>
                <p className="rw-phone-title">As-salâmu ʿalaykum wa raḥmatullâhi wa barakâtuh</p>
                <p className="rw-phone-date">
                  <b>Mardi 27 octobre</b> · 17 joumada al oula 1448 AH
                </p>

                <div className="rw-phone-prayer">
                  <svg className="rw-phone-pattern" aria-hidden="true">
                    <defs>
                      <pattern id="rw-khatam" width="28" height="28" patternUnits="userSpaceOnUse">
                        <rect x="6" y="6" width="16" height="16" fill="none" stroke="currentColor" />
                        <rect x="6" y="6" width="16" height="16" fill="none" stroke="currentColor" transform="rotate(45 14 14)" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#rw-khatam)" />
                  </svg>
                  <span className="rw-phone-label">Prochaine prière</span>
                  <div className="flex items-baseline justify-between">
                    <b className="text-[20px]">Dhuhr</b>
                    <span className="text-[11px]">
                      dans <b>2 h 10</b>
                    </span>
                  </div>
                  <b className="rw-phone-big">{timeOf("Dhuhr")}</b>
                  <ol className="rw-phone-stops">
                    {sampleTimes.map(([name, time]) => (
                      <li key={name} className={name === "Fajr" ? "is-done" : name === "Dhuhr" ? "is-next" : ""}>
                        <i />
                        {name}
                        <small>{time}</small>
                      </li>
                    ))}
                  </ol>
                </div>

                {rappels[0] && (
                  <figure className="rw-phone-card rw-phone-rappel">
                    <span className="rw-phone-label text-(--rw-mauve)!">Rappel du jour</span>
                    <blockquote className="line-clamp-4">« {rappels[0].text} »</blockquote>
                    <figcaption>
                      <b>{rappels[0].author}</b> · {rappels[0].source}
                    </figcaption>
                  </figure>
                )}

                <div className="rw-phone-card">
                  <div className="flex items-center justify-between">
                    <span className="rw-phone-label">Adhkar du matin</span>
                    <small>
                      {morningIndex + 1} / {adhkarBySession.morning.length}
                    </small>
                  </div>
                  <p className="rw-ar line-clamp-2" dir="rtl" lang="ar">
                    {morningInvocation.arabic}
                  </p>
                  <div className="flex items-center justify-between">
                    <small className="font-bold text-(--rw-sage)">
                      {morningSource.collection} {morningSource.number}
                    </small>
                    <span className="rw-phone-counter">0 / {morningInvocation.repetitions}</span>
                  </div>
                </div>
              </div>
            </div>
            <span className="rw-phone-pill rw-phone-pill-left" aria-hidden="true">
              Horaires de prière selon ta ville
            </span>
            <span className="rw-phone-pill rw-phone-pill-right" aria-hidden="true">
              Chaque invocation avec sa source
            </span>
          </div>
        </div>

      </section>

      {/* Texte d'intro révélé au défilement : la transition entre l'aube et la journée */}
      <section className="rw-sep rw-intro">
        <div className="rw-wrap">
          <p className="rw-intro-text">
            <span>
              Du Fajr au Icha, cinq prières rythment ta journée. Rawdah l’organise autour d’elles : tes
              adhkar, ton Coran, tes cours et ton cycle trouvent leur place entre deux rendez-vous avec
              Allah, sans pression ni score.
            </span>
          </p>
        </div>
      </section>

      {/* Dhuhr : la journée s'organise */}
      <section id="journee" className="rw-moment rw-sep rw-dhuhr">
        <div className="rw-wrap rw-moment-grid">
          <div>
            <p className="rw-time-label">Dhuhr</p>
            <span className="rw-big-time text-(--rw-sage)" aria-hidden="true">
              {timeOf("Dhuhr")}
            </span>
            <h2 className="rw-h2">Ta journée s’organise autour de la prière.</h2>
            <p className="rw-text">
              Ta position ou ta ville suffit : les horaires de prière du Fajr au Icha s’affichent
              chaque matin. Tes cours de science, tes lectures et tes tâches viennent se placer
              entre deux prières. Les mosquées proches sont à portée, avec l’itinéraire.
            </p>
          </div>
          <div className="rw-moment-visual">
            <div className="rw-panel" aria-label="Exemple de planning">
              <ul className="rw-agenda">
                <li>
                  Fajr <b>{timeOf("Fajr")}</b>
                </li>
                <li className="is-now">
                  Dhuhr <b>{timeOf("Dhuhr")}</b>
                </li>
                <li className="is-task">
                  Révision al-Arbaʿîn, hadith 12 <b>14:30</b>
                </li>
                <li>
                  Asr <b>{timeOf("Asr")}</b>
                </li>
                <li>
                  Maghrib <b>{timeOf("Maghrib")}</b>
                </li>
                <li>
                  Isha <b>{timeOf("Isha")}</b>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Asr : le Coran */}
      <section className="rw-moment rw-sep rw-asr rw-moment-reverse">
        <div className="rw-wrap rw-moment-grid">
          <div>
            <p className="rw-time-label">Asr</p>
            <span className="rw-big-time text-(--rw-green)" aria-hidden="true">
              {timeOf("Asr")}
            </span>
            <h2 className="rw-h2">Le Coran reprend là où tu t’es arrêtée.</h2>
            <p className="rw-text">
              Les 114 sourates, verset par verset : arabe, phonétique et traduction française.
              Plusieurs récitateurs, et une écoute qui continue d’une page à l’autre. Chaque jour,
              un mot du Coran avec sa traduction.
            </p>
          </div>
          <div className="rw-moment-visual">
            <div className="rw-device" aria-label="Exemple : lecture de la sourate al-Kahf">
              <div className="rw-device-head">
                <b>Al-Kahf · verset 10</b>
                <span className="rw-ar text-[22px] text-(--rw-green)" dir="rtl" lang="ar">
                  الكهف
                </span>
              </div>
              <p className="rw-ar" dir="rtl" lang="ar">
                {kahfVerse.arabic}
              </p>
              <p className="rw-device-text">{kahfVerse.translation}</p>
              <p className="mt-2 text-[12px] text-(--rw-muted)">
                Traduction mot à mot du Dr Usama Nonnenmacher
              </p>
              {/* Lecture pilotée par le petit script de index.html : s’arrête quand la carte sort de l’écran. */}
              <div className="rw-player" data-rw-player>
                <audio src={kahfAudio} preload="none" />
                <button
                  type="button"
                  className="rw-play"
                  aria-label="Écouter le verset 10 d’al-Kahf, récité par Saoud al-Shuraim"
                >
                  <svg className="rw-icon-play" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                  </svg>
                  <svg className="rw-icon-pause" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" />
                  </svg>
                </button>
                <span className="rw-progress">
                  <span />
                </span>
                <span>Saoud al-Shuraim</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Maghrib : les adhkar du soir et leurs preuves */}
      <section id="sources" className="rw-moment rw-sep rw-maghrib">
        <div className="rw-wrap rw-moment-grid">
          <div>
            <p className="rw-time-label">Maghrib</p>
            <span className="rw-big-time text-(--rw-mauve)" aria-hidden="true">
              {timeOf("Maghrib")}
            </span>
            <h2 className="rw-h2">Le soir venu, chaque invocation avec sa preuve.</h2>
            <p className="rw-text">
              {adhkarBySession.morning.length} adhkar le matin, {adhkarBySession.evening.length} le
              soir, tirés du Coran et de la Sunna authentique. Sous chacun : le rapporteur, le
              recueil, le numéro et le degré d’authenticité, tels que publiés par sunnah.com.
            </p>
          </div>
          <div className="rw-moment-visual">
            <div className="rw-panel" aria-label="Exemple : invocation du soir et sa preuve">
              <p className="rw-ar mt-0!" dir="rtl" lang="ar">
                {eveningInvocation.arabic}
              </p>
              <p className="rw-device-text">{eveningInvocation.meaning}</p>
              <dl className="rw-proof">
                <div>
                  <dt>Rapporteur</dt>
                  <dd>{eveningInvocation.proof.narrator}</dd>
                </div>
                <div>
                  <dt>Recueil</dt>
                  <dd>{eveningSource.collection}</dd>
                </div>
                <div>
                  <dt>Numéro</dt>
                  <dd>{eveningSource.number}</dd>
                </div>
                <div>
                  <dt>Degré</dt>
                  <dd>
                    {eveningGrade.grade} selon {eveningGrade.by}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Isha : la nuit, le cycle */}
      <section className="rw-moment rw-sep rw-isha rw-moment-reverse">
        <div className="rw-wrap rw-moment-grid">
          <div>
            <p className="rw-time-label">Isha</p>
            <span className="rw-big-time text-(--rw-sage)" aria-hidden="true">
              {timeOf("Isha")}
            </span>
            <h2 className="rw-h2">Ton cycle et ton qada, au même endroit.</h2>
            <p className="rw-text">
              Note tes jours de règles, vois les prochaines dates estimées, compte tes jeûnes à
              rattraper. Le mode ‘Udhr retire les prières de ton planning le temps des règles.
            </p>
          </div>
          <div className="rw-moment-visual">
            <div className="rw-device rw-device-dark" aria-label="Exemple : suivi du cycle">
              <div className="rw-device-head">
                <b>Cycle</b>
              </div>
              <div className="rw-days">
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
              <div className="rw-qada">
                <span>
                  <span className="text-[12px] text-[rgba(247,244,236,0.75)]">Jeûnes à rattraper</span>
                  <b>3 jours</b>
                </span>
                <span className="rw-tag">Mode ‘Udhr</span>
              </div>
            </div>
          </div>
        </div>
        <p className="rw-wrap mt-16! text-center text-[13px] text-(--rw-muted)">
          Écrans ci-dessus : données d’exemple.
        </p>
      </section>

      {/* Nuit : principes, pour qui, questions */}
      <section className="rw-night rw-sep">
        <div className="rw-wrap">
          <div className="rw-principles">
            {principles.map(({ title, text }) => (
              <div key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>

          <div id="faq" className="rw-faq">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />
            <h2 className="rw-h2 mt-0!">Tes questions</h2>
            <div>
              {faqs.map(({ question, answer }) => (
                <details key={question}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <footer className="rw-final rw-sep">
          <div className="rw-wrap">
            <h2>Demain, au Fajr, une nouvelle journée commence.</h2>
            <a href={authHref} className="rw-btn rw-btn-dark mt-8">
              Créer mon espace
            </a>
          </div>
          <div className="rw-wrap rw-wordmark-stage" aria-hidden="true">
            <span className="rw-wordmark">Rawdah</span>
            <span className="rw-wordmark-pill rw-wordmark-pill-left">Chaque invocation avec sa source</span>
            <span className="rw-wordmark-pill rw-wordmark-pill-right">Zéro publicité</span>
          </div>
          <div className="rw-wrap rw-footer-bar">
            <span>© Rawdah · Selon le Coran et la Sunna authentique</span>
            <nav className="flex gap-6" aria-label="Pied de page">
              <a href="#journee">La journée</a>
              <a href="#sources">Nos sources</a>
              <a href="#faq">Questions</a>
            </nav>
          </div>
        </footer>
      </section>
    </main>
  );
}
