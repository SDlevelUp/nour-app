export type QuranResumePosition = {
  surahNumber?: number;
  surah: string;
  ayah: number;
  endAyah: number;
  reciterIdentifier?: string;
  reciter: string;
};

export const quranResumeEvent = "nour-quran-resume-updated";

const storageKey = "nour-quran-resume-position";

export function readQuranResumePosition(): QuranResumePosition | null {
  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(storageKey) ?? "null",
    );
    if (!value || typeof value !== "object") return null;

    const position = value as Partial<QuranResumePosition>;
    if (
      typeof position.surah !== "string" ||
      typeof position.ayah !== "number" ||
      typeof position.endAyah !== "number" ||
      typeof position.reciter !== "string"
    ) {
      return null;
    }

    return position as QuranResumePosition;
  } catch {
    return null;
  }
}

export function resumePositionFromReadingLog(entry: {
  passage: string;
  pagesOrVerses?: string;
  notes?: string;
}): QuranResumePosition | null {
  const surah = entry.passage.match(/^(.+?)\s*·\s*récitation suivie$/i)?.[1];
  const verses = entry.pagesOrVerses?.match(/^Versets\s+(\d+)\s+à\s+(\d+)$/i);
  if (!surah || !verses) return null;

  return {
    surah: surah.trim(),
    ayah: Number(verses[2]),
    endAyah: Number(verses[2]),
    reciter: entry.notes?.match(/^Récitateur\s*:\s*(.+)$/im)?.[1] ?? "",
  };
}

export function saveQuranResumePosition(position: QuranResumePosition) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(position));
    window.dispatchEvent(
      new CustomEvent<QuranResumePosition>(quranResumeEvent, {
        detail: position,
      }),
    );
  } catch {
    // Local playback resume is optional if storage is unavailable.
  }
}
