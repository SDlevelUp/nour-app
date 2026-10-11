import { Button } from "@/components/ui/button";
import {
  saveQuranResumePosition,
  type QuranResumePosition,
} from "@/components/dashboard/quranPlaybackResume";
import { BookOpen, Loader2, Repeat2, Volume2 } from "lucide-react";
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
};

type SurahAudio = Surah & { ayahs: Ayah[] };

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
}: {
  isSavingProgress: boolean;
  onSaveProgress: (progress: QuranPlaybackProgress) => Promise<boolean>;
  resumePosition?: QuranResumePosition | null;
}) {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [basmala, setBasmala] = useState("");
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedReciter, setSelectedReciter] = useState("ar.alafasy");
  const [surahData, setSurahData] = useState<SurahAudio | null>(null);
  const [startAyah, setStartAyah] = useState(1);
  const [endAyah, setEndAyah] = useState(1);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [repeatCount, setRepeatCount] = useState(1);
  const [repeatNumber, setRepeatNumber] = useState(1);
  const [lastCompletedAyah, setLastCompletedAyah] = useState(0);
  const [isProgressSaved, setIsProgressSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    ])
      .then(([surahList, reciterList, basmalaAyah]) => {
        setSurahs(surahList);
        setReciters(reciterList);
        setBasmala(basmalaAyah.text.replace(/^\uFEFF/, "").trim());
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
    if (!reciters.some((reciter) => reciter.identifier === selectedReciter))
      return;
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);
    setLastCompletedAyah(0);
    setIsProgressSaved(false);
    fetchApi<SurahAudio>(
      `${API}/surah/${selectedSurah}/${selectedReciter}`,
      controller.signal,
    )
      .then((data) => {
        setSurahData(data);
        const pendingResume = pendingResumeRef.current;
        if (
          pendingResume &&
          pendingResume.surahNumber === data.number &&
          pendingResume.reciterIdentifier === selectedReciter
        ) {
          const ayah = Math.min(
            Math.max(pendingResume.ayah, 1),
            data.numberOfAyahs,
          );
          setStartAyah(ayah);
          setEndAyah(
            Math.min(Math.max(pendingResume.endAyah, ayah), data.numberOfAyahs),
          );
          setCurrentAyah(ayah);
          pendingResumeRef.current = null;
          appliedResumeRef.current = `${data.number}:${ayah}:${selectedReciter}`;
          hasInteractedRef.current = true;
        } else {
          setStartAyah(1);
          setEndAyah(data.numberOfAyahs);
          setCurrentAyah(1);
        }
        setRepeatNumber(1);
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
    if (!isPlaying) return;
    const audio = audioRef.current;
    if (audio) void audio.play().catch(() => setIsPlaying(false));
  }, [currentAyah, isPlaying, surahData]);

  const activeAyah = surahData?.ayahs.find(
    (ayah) => ayah.numberInSurah === currentAyah,
  );
  const shouldShowBasmala =
    currentAyah === 1 && selectedSurah !== 1 && selectedSurah !== 9 && !!basmala;
  const rawAyahText = activeAyah?.text.replace(/^\uFEFF/, "").trim() ?? "";
  const displayAyahText =
    shouldShowBasmala && rawAyahText.startsWith(basmala)
      ? rawAyahText.slice(basmala.length).trim()
      : rawAyahText;
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
    } else {
      setIsPlaying(false);
    }
  };

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

  return (
    <section className="mt-6 rounded-3xl border border-[#DCE5DC] bg-white p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-800">
          <Volume2 className="size-5" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700">
            Écoute & répétition
          </p>
          <h2 className="mt-1 text-lg font-semibold text-stone-900">
            Réviser à ton rythme
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-stone-600">
          Sourate
          <select
            value={selectedSurah}
            onChange={(event) => {
              hasInteractedRef.current = true;
              setSelectedSurah(Number(event.target.value));
            }}
            disabled={isLoading || !surahs.length}
            className="mt-1.5 h-11 w-full rounded-xl border border-violet-100 bg-white px-3 text-sm text-stone-800"
          >
            {surahs.map((surah) => (
              <option key={surah.number} value={surah.number}>
                {surah.number}. {surah.englishName} · {surah.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-stone-600">
          Récitateur
          <select
            value={selectedReciter}
            onChange={(event) => setSelectedReciter(event.target.value)}
            disabled={isLoading || !reciters.length}
            className="mt-1.5 h-11 w-full rounded-xl border border-violet-100 bg-white px-3 text-sm text-stone-800"
          >
            {reciters.map((reciter) => (
              <option key={reciter.identifier} value={reciter.identifier}>
                {reciter.englishName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-medium text-stone-600">
          De la sourate
          <select
            value={startAyah}
            onChange={(event) => updateRangeStart(Number(event.target.value))}
            disabled={!surahData}
            className="mt-1.5 h-11 w-full rounded-xl border border-violet-100 bg-white px-3 text-sm text-stone-800"
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
        <label className="text-xs font-medium text-stone-600">
          Jusqu’au verset
          <select
            value={endAyah}
            onChange={(event) => updateRangeEnd(Number(event.target.value))}
            disabled={!surahData}
            className="mt-1.5 h-11 w-full rounded-xl border border-violet-100 bg-white px-3 text-sm text-stone-800"
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
        <label className="text-xs font-medium text-stone-600">
          Répéter chaque verset
          <select
            value={repeatCount}
            onChange={(event) => setRepeatCount(Number(event.target.value))}
            className="mt-1.5 h-11 w-full rounded-xl border border-violet-100 bg-white px-3 text-sm text-stone-800"
          >
            <option value={1}>1 fois</option>
            <option value={2}>2 fois</option>
            <option value={3}>3 fois</option>
            <option value={4}>4 fois</option>
            <option value={5}>5 fois</option>
            <option value={0}>En boucle</option>
          </select>
        </label>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800"
        >
          {error}
        </p>
      )}
      {isLoading && (
        <p
          className="mt-4 flex items-center gap-2 text-sm text-stone-500"
          role="status"
        >
          <Loader2 className="size-4 animate-spin" /> Chargement du lecteur…
        </p>
      )}

      {activeAyah && !isLoading && (
        <div className="mt-5 rounded-2xl border border-violet-100 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
            <span>
              {selectedSurahData?.englishName} · verset {currentAyah}/{endAyah}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Repeat2 className="size-3.5" />{" "}
              {repeatCount === 0 ? "Boucle" : `${repeatNumber}/${repeatCount}`}
            </span>
          </div>
          {shouldShowBasmala && (
            <p
              lang="ar"
              dir="rtl"
              className="quran-verse mt-5 text-center text-2xl leading-[2] text-stone-700 sm:text-3xl"
            >
              {basmala}
            </p>
          )}
          <p
            lang="ar"
            dir="rtl"
            className="quran-verse mt-5 text-right text-3xl leading-[2] text-stone-900 sm:text-4xl"
          >
            {displayAyahText}
          </p>
          <audio
            ref={audioRef}
            key={`${selectedReciter}-${currentAyah}`}
            controls
            preload="none"
            src={activeAyah.audio}
            className="mt-4 w-full accent-violet-700"
            onPlay={() => {
              hasInteractedRef.current = true;
              setIsPlaying(true);
            }}
            onPause={(event) => {
              if (!event.currentTarget.ended) setIsPlaying(false);
            }}
            onEnded={handleEnded}
          >
            Ton navigateur ne peut pas lire cet audio.
          </audio>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-stone-500">
              {selectedReciterData?.englishName} · répétition par verset
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={
                !lastCompletedAyah || isSavingProgress || isProgressSaved
              }
              onClick={async () => {
                const saved = await onSaveProgress({
                  surah:
                    selectedSurahData?.englishName ??
                    `Sourate ${selectedSurah}`,
                  startAyah,
                  lastCompletedAyah,
                  reciter: selectedReciterData?.englishName ?? selectedReciter,
                });
                setIsProgressSaved(saved);
              }}
              className="gap-2 border-violet-200 text-violet-800 hover:bg-violet-50"
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
            </Button>
          </div>
        </div>
      )}
      <p className="mt-3 text-[11px] leading-5 text-stone-500">
        Audio fourni par AlQuran Cloud. La répétition et le suivi sont gérés
        dans Nour.
      </p>
    </section>
  );
}
