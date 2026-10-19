import { NourMark } from "@/components/NourMark";
import {
  saveQuranResumePosition,
  type QuranResumePosition,
} from "@/components/dashboard/quranPlaybackResume";
import {
  BookOpen,
  Loader2,
  Pause,
  Play,
  Repeat2,
  ChevronsLeft,
  ChevronsRight,
  Search,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const API = "https://api.alquran.cloud/v1";

type ApiResponse<T> = {
  code: number;
  status: string;
  data: T;
};

type Surah = {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType?: string;
};

type Reciter = {
  identifier: string;
  englishName: string;
  name: string;
};

type Ayah = {
  numberInSurah: number;
  text: string;
  audio: string;
  transliteration?: string;
  translation?: string;
};

type SurahAudio = Surah & { ayahs: Ayah[] };

type QuranJson = {
  sourates: {
    position: number;
    nom: string;
    nom_phonetique: string;
    englishNameTranslation: string;
    revelation: string;
    versets: {
      position: number;
      text: string;
      position_ds_sourate: number;
      text_arabe: string;
    }[];
  }[];
};

export type QuranPlaybackProgress = {
  surah: string;
  startAyah: number;
  lastCompletedAyah: number;
  reciter: string;
};

async function fetchApi<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Le service de lecture est indisponible.");
  const result = (await response.json()) as ApiResponse<T>;
  if (result.code !== 200) throw new Error("Impossible de charger ce contenu.");
  return result.data;
}

export function QuranAudioReader({
  isSavingProgress,
  onSaveProgress,
  resumePosition = null,
  isActive = true,
  onOpen,
}: {
  isSavingProgress: boolean;
  onSaveProgress: (progress: QuranPlaybackProgress) => Promise<boolean>;
  resumePosition?: QuranResumePosition | null;
  // Faux quand on est sur une autre page : le lecteur reste monté pour que
  // l'écoute continue, et seule la mini-fenêtre est affichée.
  isActive?: boolean;
  onOpen?: () => void;
}) {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [basmala, setBasmala] = useState("");
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedReciter, setSelectedReciter] = useState("ar.alafasy");
  const [surahData, setSurahData] = useState<SurahAudio | null>(null);
  const [quranJsonData, setQuranJsonData] = useState<QuranJson | null>(null);
  const [transliterationData, setTransliterationData] = useState<SurahAudio | null>(null);
  const [startAyah, setStartAyah] = useState(1);
  const [endAyah, setEndAyah] = useState(1);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [repeatCount, setRepeatCount] = useState(1);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [repeatNumber, setRepeatNumber] = useState(1);
  const [lastCompletedAyah, setLastCompletedAyah] = useState(0);
  const [isProgressSaved, setIsProgressSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [endBehavior, setEndBehavior] = useState<"stop" | "next" | "repeat">("stop");
  const [showMiniOptions, setShowMiniOptions] = useState(false);
  // Lecture à relancer une fois la nouvelle sourate (ou le récitateur) chargé.
  const autoplayAfterLoadRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [surahQuery, setSurahQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const pendingResumeRef = useRef<QuranResumePosition | null>(null);
  const appliedResumeRef = useRef<string | null>(null);
  const hasInteractedRef = useRef(false);
  const selectedSurahData = surahs.find(
    (surah) => surah.number === selectedSurah,
  );
  const selectedReciterData = reciters.find(
    (reciter) => reciter.identifier === selectedReciter,
  );

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetchApi<Surah[]>(`${API}/surah`, controller.signal),
      fetchApi<Reciter[]>(
        `${API}/edition?format=audio&language=ar&type=versebyverse`,
        controller.signal,
      ),
      fetchApi<Ayah>(`${API}/ayah/1/ar.alafasy`, controller.signal),
      fetchApi<SurahAudio>(`${API}/surah/1/ar.alafasy`, controller.signal),
      fetchApi<SurahAudio>(`${API}/surah/1/en.transliteration`, controller.signal),
      fetch("https://raw.githubusercontent.com/mehdi-stark/Coran-Quran/master/quran.json", { signal: controller.signal }),
    ])
      .then(async ([surahList, reciterList, basmalaAyah, audioData, transliterationData, quranResponse]) => {
        const quranJson = await quranResponse.json() as QuranJson;
        setSurahs(surahList);
        setReciters(reciterList);
        setBasmala(basmalaAyah.text.replace(/^\uFEFF/, "").trim());
        setSurahData(audioData);
        setQuranJsonData(quranJson);
        setTransliterationData(transliterationData);
        setStartAyah(1);
        setEndAyah(audioData.numberOfAyahs);
        setCurrentAyah(1);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Impossible de joindre le service de lecture.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!reciters.length || !reciters.some((reciter) => reciter.identifier === selectedReciter))
      return;
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);
    setLastCompletedAyah(0);
    setIsProgressSaved(false);
    Promise.all([
      fetchApi<SurahAudio>(`${API}/surah/${selectedSurah}/${selectedReciter}`, controller.signal),
      fetchApi<SurahAudio>(`${API}/surah/${selectedSurah}/en.transliteration`, controller.signal),
    ])
      .then(([audioData, transliterationData]) => {
        setSurahData(audioData);
        setTransliterationData(transliterationData);
        const pendingResume = pendingResumeRef.current;
        if (
          pendingResume &&
          pendingResume.surahNumber === audioData.number &&
          pendingResume.reciterIdentifier === selectedReciter
        ) {
          const ayah = Math.min(
            Math.max(pendingResume.ayah, 1),
            audioData.numberOfAyahs,
          );
          setStartAyah(ayah);
          setEndAyah(
            Math.min(Math.max(pendingResume.endAyah, ayah), audioData.numberOfAyahs),
          );
          setCurrentAyah(ayah);
          pendingResumeRef.current = null;
          appliedResumeRef.current = `${audioData.number}:${ayah}:${selectedReciter}`;
          hasInteractedRef.current = true;
        } else {
          setStartAyah(1);
          setEndAyah(audioData.numberOfAyahs);
          setCurrentAyah(1);
        }
        setRepeatNumber(1);
        if (autoplayAfterLoadRef.current) {
          autoplayAfterLoadRef.current = false;
          hasInteractedRef.current = true;
          setIsPlaying(true);
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Impossible de charger cette sourate.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [selectedReciter, selectedSurah, reciters]);

  useEffect(() => {
    if (!resumePosition || !surahs.length || !reciters.length) return;
    const normalizedSurahName = resumePosition.surah
      .toLocaleLowerCase("en")
      .replace(/[^a-z0-9]/g, "");
    const surah = surahs.find(
      (item) =>
        item.number === resumePosition.surahNumber ||
        item.englishName.toLocaleLowerCase("en").replace(/[^a-z0-9]/g, "") ===
          normalizedSurahName,
    );
    if (!surah) return;

    const requestedReciter = reciters.find(
      (item) =>
        item.identifier === resumePosition.reciterIdentifier ||
        (resumePosition.reciter !== "" &&
          item.englishName.toLocaleLowerCase("en") ===
            resumePosition.reciter.toLocaleLowerCase("en")),
    );
    const reciterIdentifier = requestedReciter?.identifier ?? selectedReciter;
    const resumeKey = `${surah.number}:${resumePosition.ayah}:${reciterIdentifier}`;
    if (appliedResumeRef.current === resumeKey) return;

    const target: QuranResumePosition = {
      ...resumePosition,
      surahNumber: surah.number,
      surah: surah.englishName,
      endAyah: Math.min(resumePosition.endAyah, surah.numberOfAyahs),
      reciterIdentifier,
      reciter:
        requestedReciter?.englishName ??
        reciters.find((item) => item.identifier === reciterIdentifier)
          ?.englishName ??
        resumePosition.reciter,
    };
    pendingResumeRef.current = target;
    hasInteractedRef.current = true;

    const loadedSurah = surahData;
    if (
      loadedSurah?.number === surah.number &&
      selectedReciter === reciterIdentifier
    ) {
      const ayah = Math.min(
        Math.max(target.ayah, 1),
        loadedSurah.numberOfAyahs,
      );
      setStartAyah(ayah);
      setEndAyah(
        Math.min(Math.max(target.endAyah, ayah), loadedSurah.numberOfAyahs),
      );
      setCurrentAyah(ayah);
      pendingResumeRef.current = null;
      appliedResumeRef.current = resumeKey;
    } else {
      setSelectedSurah(surah.number);
      setSelectedReciter(reciterIdentifier);
    }
  }, [reciters, resumePosition, selectedReciter, surahData, surahs]);

  useEffect(() => {
    if (
      !hasInteractedRef.current ||
      !surahData ||
      surahData.number !== selectedSurah ||
      !selectedSurahData ||
      !selectedReciterData
    ) {
      return;
    }
    saveQuranResumePosition({
      surahNumber: selectedSurah,
      surah: selectedSurahData.englishName,
      ayah: currentAyah,
      endAyah,
      reciterIdentifier: selectedReciter,
      reciter: selectedReciterData.englishName,
    });
  }, [
    currentAyah,
    endAyah,
    isPlaying,
    selectedReciter,
    selectedReciterData,
    selectedSurah,
    selectedSurahData,
    surahData,
  ]);

  useEffect(() => {
    if (!isPlaying || isLoading) return;
    const audio = audioRef.current;
    if (audio) void audio.play().catch(() => setIsPlaying(false));
  }, [currentAyah, isLoading, isPlaying, surahData]);

  const activeAyah = surahData?.ayahs.find(
    (ayah) => ayah.numberInSurah === currentAyah,
  );
  const showsBasmala = selectedSurah !== 1 && selectedSurah !== 9 && !!basmala;
  const jsonVerses = quranJsonData?.sourates[selectedSurah - 1]?.versets;
  const ayahArabic = (ayah: Ayah) => {
    const fromJson = jsonVerses?.find(
      (verse) => verse.position_ds_sourate === ayah.numberInSurah,
    )?.text_arabe;
    if (fromJson) return fromJson;
    const raw = ayah.text.replace(/^\uFEFF/, "").trim();
    return ayah.numberInSurah === 1 && showsBasmala && raw.startsWith(basmala)
      ? raw.slice(basmala.length).trim()
      : raw;
  };
  const normalizedQuery = surahQuery
    .trim()
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f'’-]/g, "");
  const visibleSurahs = normalizedQuery
    ? surahs.filter(
        (surah) =>
          String(surah.number) === normalizedQuery ||
          surah.englishName
            .toLocaleLowerCase("en")
            .replace(/['’-]/g, "")
            .includes(normalizedQuery) ||
          surah.name.includes(surahQuery.trim()),
      )
    : surahs;

  useEffect(() => {
    if (!isPlaying || !isActive) return;
    document
      .getElementById(`quran-ayah-${currentAyah}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentAyah, isActive, isPlaying]);
  const handleEnded = () => {
    if (repeatCount === 0 || repeatNumber < repeatCount) {
      setRepeatNumber((count) => count + 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        void audioRef.current.play();
      }
      return;
    }

    setLastCompletedAyah(currentAyah);
    setIsProgressSaved(false);
    setRepeatNumber(1);
    if (currentAyah < endAyah) {
      setCurrentAyah((ayah) => ayah + 1);
    } else if (endBehavior === "repeat") {
      setCurrentAyah(startAyah);
      if (startAyah === currentAyah && audioRef.current) {
        audioRef.current.currentTime = 0;
        void audioRef.current.play();
      }
    } else if (endBehavior === "next" && selectedSurah < 114) {
      goToSurah(selectedSurah + 1);
    } else {
      setIsPlaying(false);
    }
  };

  function goToSurah(surahNumber: number) {
    if (surahNumber < 1 || surahNumber > 114) return;
    autoplayAfterLoadRef.current = isPlaying || hasStarted;
    hasInteractedRef.current = true;
    setSelectedSurah(surahNumber);
  }

  const updateRangeStart = (value: number) => {
    hasInteractedRef.current = true;
    setStartAyah(value);
    setCurrentAyah(value);
    setLastCompletedAyah(0);
    setIsProgressSaved(false);
    if (value > endAyah) setEndAyah(value);
  };

  const updateRangeEnd = (value: number) => {
    setEndAyah(value);
    setLastCompletedAyah(0);
    setIsProgressSaved(false);
    if (value < startAyah) {
      setStartAyah(value);
      setCurrentAyah(value);
    }
  };

  const goToAyah = (ayah: number) => {
    const total = surahData?.numberOfAyahs ?? 1;
    const target = Math.min(Math.max(ayah, 1), total);
    hasInteractedRef.current = true;
    setRepeatNumber(1);
    setCurrentAyah(target);
    if (target > endAyah) setEndAyah(target);
    if (target < startAyah) setStartAyah(target);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const stopPlayback = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
    setHasStarted(false);
  };

  const playFromAyah = (ayah: number) => {
    updateRangeStart(ayah);
    setRepeatNumber(1);
    setIsPlaying(true);
  };

  const reciterSelect = (
    <label className="grid gap-1 text-[13px] font-semibold">
      Récitateur
      <select
        value={selectedReciter}
        onChange={(event) => {
          autoplayAfterLoadRef.current = isPlaying;
          setSelectedReciter(event.target.value);
        }}
        disabled={!reciters.length}
        className="n-select"
      >
        {reciters.map((reciter) => (
          <option key={reciter.identifier} value={reciter.identifier}>
            {reciter.englishName}
          </option>
        ))}
      </select>
    </label>
  );
  const repeatSelect = (
    <label className="grid gap-1 text-[13px] font-semibold">
      Répéter chaque verset
      <select
        value={repeatCount}
        onChange={(event) => setRepeatCount(Number(event.target.value))}
        className="n-select"
      >
        <option value={1}>1 fois</option>
        <option value={2}>2 fois</option>
        <option value={3}>3 fois</option>
        <option value={4}>4 fois</option>
        <option value={5}>5 fois</option>
        <option value={0}>En boucle</option>
      </select>
    </label>
  );
  const endSelect = (
    <label className="grid gap-1 text-[13px] font-semibold">
      À la fin de la sourate
      <select
        value={endBehavior}
        onChange={(event) =>
          setEndBehavior(event.target.value as "stop" | "next" | "repeat")
        }
        className="n-select"
      >
        <option value="stop">Arrêter</option>
        <option value="next">Sourate suivante</option>
        <option value="repeat">Recommencer</option>
      </select>
    </label>
  );

  return (
    <>
    <div className="n-quran" hidden={!isActive}>
      <aside className="n-card n-quran-aside p-4!" aria-label="Choix de la sourate">
        <label className="relative block">
          <span className="sr-only">Rechercher une sourate</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--n-muted)"
            aria-hidden="true"
          />
          <input
            value={surahQuery}
            onChange={(event) => setSurahQuery(event.target.value)}
            placeholder="Rechercher une sourate…"
            className="n-input pl-9!"
          />
        </label>
        <div className="n-surah-list">
          {visibleSurahs.map((surah) => (
            <button
              key={surah.number}
              type="button"
              onClick={() => {
                hasInteractedRef.current = true;
                setIsPlaying(false);
                setSelectedSurah(surah.number);
              }}
              aria-current={surah.number === selectedSurah}
              className="n-surah-item"
            >
              <span className="n-surah-num">
                <NourMark />
                <span className="relative">{surah.number}</span>
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold">{surah.englishName}</span>
                <span className="block text-[13px] text-(--n-muted)">
                  {surah.numberOfAyahs} versets
                </span>
              </span>
              <span className="n-surah-name-ar" lang="ar">
                {surah.name.replace(/^سُورَةُ\s*/, "")}
              </span>
            </button>
          ))}
          {surahs.length > 0 && visibleSurahs.length === 0 && (
            <p className="p-2 text-sm text-(--n-muted)">Aucune sourate trouvée.</p>
          )}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="n-card n-card-tint flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="n-label">
              Sourate {selectedSurah}
              {selectedSurahData?.revelationType
                ? ` · ${selectedSurahData.revelationType.toLowerCase() === "meccan" ? "mecquoise" : "médinoise"}`
                : ""}
            </span>
            <h2 className="n-display mt-2 text-[28px] leading-tight">
              {selectedSurahData?.englishName ?? "…"}
            </h2>
            <p className="text-[15px] text-(--n-muted)">
              {selectedSurahData ? `${selectedSurahData.numberOfAyahs} versets` : ""}
            </p>
          </div>
          <p className="n-surah-name-ar text-[40px]! leading-none" lang="ar">
            {selectedSurahData?.name.replace(/^سُورَةُ\s*/, "")}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="n-toggle"
            aria-pressed={showTransliteration}
            onClick={() => setShowTransliteration((value) => !value)}
          >
            Phonétique
          </button>
          <button
            type="button"
            className="n-toggle"
            aria-pressed={showTranslation}
            onClick={() => setShowTranslation((value) => !value)}
          >
            Traduction française
          </button>
        </div>

        {error && (
          <p role="alert" className="n-chip mt-4">
            {error}
          </p>
        )}

        <div className="n-card mt-4 px-3! py-2! sm:px-5!">
          {isLoading ? (
            <p className="flex items-center gap-2 p-4 text-[15px] text-(--n-muted)" role="status">
              <Loader2 className="size-4 animate-spin" /> Chargement de la sourate…
            </p>
          ) : (
            <>
              {showsBasmala && (
                <p className="n-arabic py-6 text-center! text-[28px]" lang="ar">
                  {basmala}
                </p>
              )}
              {surahData?.ayahs.map((ayah) => (
                <button
                  key={ayah.numberInSurah}
                  id={`quran-ayah-${ayah.numberInSurah}`}
                  type="button"
                  className="n-ayah"
                  data-active={ayah.numberInSurah === currentAyah}
                  onClick={() => playFromAyah(ayah.numberInSurah)}
                  aria-label={`Écouter à partir du verset ${ayah.numberInSurah}`}
                >
                  <span className="n-ayah-arabic block" lang="ar">
                    {ayahArabic(ayah)}
                    <span className="n-ayah-num">{ayah.numberInSurah}</span>
                  </span>
                  {showTransliteration && (
                    <span className="n-ayah-translit block">
                      {transliterationData?.ayahs.find(
                        (item) => item.numberInSurah === ayah.numberInSurah,
                      )?.text ?? "Phonétique non disponible."}
                    </span>
                  )}
                  {showTranslation && (
                    <span className="n-ayah-translation block">
                      {jsonVerses?.find(
                        (verse) => verse.position_ds_sourate === ayah.numberInSurah,
                      )?.text ?? "Traduction non disponible."}
                    </span>
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        {activeAyah && !isLoading && (
          <div className="n-player">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-semibold">
                {selectedSurahData?.englishName} · verset {currentAyah}
                <span className="font-normal text-(--n-muted)"> / {endAyah}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-(--n-muted)">
                <Repeat2 className="size-4" />
                {repeatCount === 0 ? "En boucle" : `${repeatNumber}/${repeatCount}`}
              </span>
            </div>
            <audio
              ref={audioRef}
              key={`${selectedReciter}-${currentAyah}`}
              controls
              preload="none"
              src={activeAyah.audio}
              className="mt-2 w-full"
              onPlay={() => {
                hasInteractedRef.current = true;
                setHasStarted(true);
                setIsPlaying(true);
              }}
              onPause={(event) => {
                if (!event.currentTarget.ended) setIsPlaying(false);
              }}
              onEnded={handleEnded}
            >
              Ton navigateur ne peut pas lire cet audio.
            </audio>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <details className="text-sm">
                <summary className="cursor-pointer font-semibold text-(--n-muted)">
                  Options d’écoute
                </summary>
                <div className="mt-3 flex flex-wrap gap-3">
                  {reciterSelect}
                  <label className="grid gap-1 text-[13px] font-semibold">
                    Jusqu’au verset
                    <select
                      value={endAyah}
                      onChange={(event) => updateRangeEnd(Number(event.target.value))}
                      disabled={!surahData}
                      className="n-select"
                    >
                      {Array.from(
                        { length: selectedSurahData?.numberOfAyahs ?? 0 },
                        (_, index) => index + 1,
                      ).map((ayah) => (
                        <option key={ayah} value={ayah}>
                          Verset {ayah}
                        </option>
                      ))}
                    </select>
                  </label>
                  {repeatSelect}
                  {endSelect}
                </div>
              </details>
              <button
                type="button"
                disabled={!lastCompletedAyah || isSavingProgress || isProgressSaved}
                onClick={async () => {
                  const saved = await onSaveProgress({
                    surah: selectedSurahData?.englishName ?? `Sourate ${selectedSurah}`,
                    startAyah,
                    lastCompletedAyah,
                    reciter: selectedReciterData?.englishName ?? selectedReciter,
                  });
                  setIsProgressSaved(saved);
                }}
                className="n-btn n-btn-sage px-4! py-2.5! text-sm! disabled:opacity-50"
              >
                {isSavingProgress ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <BookOpen className="size-4" />
                )}
                {isSavingProgress
                  ? "Enregistrement…"
                  : isProgressSaved
                    ? "Progression enregistrée"
                    : "Enregistrer ma progression"}
              </button>
            </div>
          </div>
        )}
        <p className="mt-3 text-[13px] leading-5 text-(--n-muted)">
          Texte arabe et audio : Al Qur’an Cloud. Touche un verset pour
          l’écouter à partir de là.
        </p>
      </div>
    </div>

    {!isActive && hasStarted && activeAyah && (
      <div className="n-mini-player" role="region" aria-label="Lecture du Coran en cours">
        {showMiniOptions && (
          <div className="n-mini-options">
            {repeatSelect}
            {endSelect}
            {reciterSelect}
          </div>
        )}
        <div className="n-mini-row">
        <button type="button" className="n-mini-info" onClick={onOpen}>
          <span className="n-surah-num">
            <NourMark />
            <span className="relative">{selectedSurah}</span>
          </span>
          <span className="min-w-0 text-left">
            <span className="block truncate font-semibold">
              {selectedSurahData?.englishName}
            </span>
            <span className="block text-[13px] text-(--n-muted)">
              Verset {currentAyah} / {surahData?.numberOfAyahs}
            </span>
          </span>
        </button>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            className="n-icon-btn n-mini-wide"
            onClick={() => goToSurah(selectedSurah - 1)}
            disabled={selectedSurah <= 1 || isLoading}
            aria-label="Sourate précédente"
          >
            <ChevronsLeft className="size-4" />
          </button>
          <button
            type="button"
            className="n-icon-btn"
            onClick={() => goToAyah(currentAyah - 1)}
            disabled={currentAyah <= 1}
            aria-label="Verset précédent"
          >
            <SkipBack className="size-4" />
          </button>
          <button
            type="button"
            className="n-mini-play"
            onClick={togglePlayback}
            aria-label={isPlaying ? "Pause" : "Reprendre la lecture"}
          >
            {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
          </button>
          <button
            type="button"
            className="n-icon-btn"
            onClick={() => goToAyah(currentAyah + 1)}
            disabled={currentAyah >= (surahData?.numberOfAyahs ?? 1)}
            aria-label="Verset suivant"
          >
            <SkipForward className="size-4" />
          </button>
          <button
            type="button"
            className="n-icon-btn n-mini-wide"
            onClick={() => goToSurah(selectedSurah + 1)}
            disabled={selectedSurah >= 114 || isLoading}
            aria-label="Sourate suivante"
          >
            <ChevronsRight className="size-4" />
          </button>
          <button
            type="button"
            className="n-icon-btn"
            aria-pressed={showMiniOptions}
            onClick={() => setShowMiniOptions((value) => !value)}
            aria-label="Réglages de lecture"
          >
            <SlidersHorizontal className="size-4" />
          </button>
          <button
            type="button"
            className="n-icon-btn"
            onClick={stopPlayback}
            aria-label="Arrêter et fermer le lecteur"
          >
            <X className="size-4" />
          </button>
        </div>
        </div>
        <span className="n-mini-progress" aria-hidden="true">
          <span
            style={{
              width: `${(currentAyah / (surahData?.numberOfAyahs ?? 1)) * 100}%`,
            }}
          />
        </span>
      </div>
    )}
    </>
  );
}
