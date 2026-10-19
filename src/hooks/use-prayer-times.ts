import { useEffect, useState } from "react";

const storageKey = "nour-prayer-preferences";

// Réglages imposés (décision du 2026-10-19) : ceux de la mosquée Al-Houda
// d'Antony sur Mawaqit, Fajr et Isha à 15° sous l'horizon et Maghrib 4 minutes
// après le coucher du soleil (AlAdhan : méthode personnalisée 99). Quand le
// soleil ne descend pas assez, AlAdhan applique la règle « angle based »
// (latitudeAdjustmentMethod=3), fixée ici explicitement.
export const prayerCalculation = {
  method: 99,
  latitudeAdjustmentMethod: 3,
  label: "Fajr et Isha à 15°, Maghrib + 4 min",
  referenceMosque: "mosquée Al-Houda d’Antony (Mawaqit)",
  fajrAngle: 15,
  ishaAngle: 15,
  maghribOffsetMinutes: 4,
} as const;

type Coordinates = {
  latitude: number;
  longitude: number;
};

type PrayerPreferences = {
  coordinates: Coordinates | null;
  school: 0 | 1;
};

export type PrayerTimes = {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

type PrayerTimesResponse = {
  code?: number;
  data?: {
    timings?: Record<string, unknown>;
  };
};

type PrayerTimesState = {
  times: PrayerTimes | null;
  isLoading: boolean;
  error: string | null;
};

const defaultPreferences: PrayerPreferences = {
  coordinates: null,
  school: 0,
};

function readPreferences(): PrayerPreferences {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return defaultPreferences;

    const value: unknown = JSON.parse(stored);
    if (!value || typeof value !== "object") return defaultPreferences;

    const preferences = value as Partial<PrayerPreferences>;
    const coordinates = preferences.coordinates;
    const hasValidCoordinates =
      coordinates !== null &&
      typeof coordinates === "object" &&
      typeof coordinates.latitude === "number" &&
      Number.isFinite(coordinates.latitude) &&
      coordinates.latitude >= -90 &&
      coordinates.latitude <= 90 &&
      typeof coordinates.longitude === "number" &&
      Number.isFinite(coordinates.longitude) &&
      coordinates.longitude >= -180 &&
      coordinates.longitude <= 180;

    return {
      coordinates: hasValidCoordinates ? coordinates : null,
      school: preferences.school === 1 ? 1 : 0,
    };
  } catch {
    return defaultPreferences;
  }
}

function normalizeTime(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function parsePrayerTimes(value: PrayerTimesResponse): PrayerTimes | null {
  const timings = value.data?.timings;
  if (value.code !== 200 || !timings) return null;

  const fajr = normalizeTime(timings.Fajr);
  const dhuhr = normalizeTime(timings.Dhuhr);
  const asr = normalizeTime(timings.Asr);
  const maghrib = normalizeTime(timings.Maghrib);
  const isha = normalizeTime(timings.Isha);
  if (!fajr || !dhuhr || !asr || !maghrib || !isha) return null;

  return { fajr, dhuhr, asr, maghrib, isha };
}

function getLocalDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-GB").format(date).replace(/\//g, "-");
}

export function usePrayerTimes() {
  const [preferences, setPreferences] = useState(readPreferences);
  const [localDate, setLocalDate] = useState(() => getLocalDateKey(new Date()));
  const [state, setState] = useState<PrayerTimesState>({
    times: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 1, 0);
    const timeout = window.setTimeout(
      () => setLocalDate(getLocalDateKey(new Date())),
      nextMidnight.getTime() - now.getTime(),
    );
    return () => window.clearTimeout(timeout);
  }, [localDate]);

  useEffect(() => {
    const coordinates = preferences.coordinates;
    if (!coordinates) {
      return;
    }

    const controller = new AbortController();
    const query = new URLSearchParams({
      latitude: String(coordinates.latitude),
      longitude: String(coordinates.longitude),
      method: String(prayerCalculation.method),
      methodSettings: `${prayerCalculation.fajrAngle},null,${prayerCalculation.ishaAngle}`,
      // Ordre AlAdhan : Imsak, Fajr, Sunrise, Dhuhr, Asr, Maghrib, Sunset, Isha, Midnight.
      tune: `0,0,0,0,0,${prayerCalculation.maghribOffsetMinutes},0,0,0`,
      latitudeAdjustmentMethod: String(
        prayerCalculation.latitudeAdjustmentMethod,
      ),
      school: String(preferences.school),
    });

    void fetch(
      `https://api.aladhan.com/v1/timings/${localDate}?${query.toString()}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Le service d’horaires a répondu (${response.status}).`,
          );
        }
        return (await response.json()) as PrayerTimesResponse;
      })
      .then((response) => {
        const times = parsePrayerTimes(response);
        if (!times) {
          throw new Error(
            "Le service n’a pas renvoyé tous les horaires de prière.",
          );
        }

        setState({
          times,
          isLoading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          times: null,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Impossible de récupérer les horaires de prière.",
        });
      });

    return () => controller.abort();
  }, [
    localDate,
    preferences.coordinates,
    preferences.school,
  ]);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setState({
        times: null,
        isLoading: false,
        error: "La géolocalisation n’est pas disponible dans ce navigateur.",
      });
      return;
    }

    setState((current) => ({ ...current, isLoading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPreferences((current) => ({
          ...current,
          coordinates: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        }));
      },
      (error) => {
        setState((current) => ({
          ...current,
          isLoading: false,
          error:
            error.code === error.PERMISSION_DENIED
              ? "Autorise la localisation dans ton navigateur pour afficher les horaires."
              : error.code === error.TIMEOUT
                ? "La demande de localisation a expiré. Réessaie."
                : "La position n’a pas pu être déterminée. Réessaie.",
        }));
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 15_000 },
    );
  };

  const setSchool = (school: 0 | 1) => {
    if (preferences.coordinates) {
      setState((current) => ({ ...current, isLoading: true, error: null }));
    }
    setPreferences((current) => ({ ...current, school }));
  };

  const clearLocation = () => {
    setPreferences((current) => ({ ...current, coordinates: null }));
    setState({ times: null, isLoading: false, error: null });
  };

  return {
    preferences,
    times: state.times,
    isLoading:
      state.isLoading ||
      (preferences.coordinates !== null &&
        state.times === null &&
        state.error === null),
    error: state.error,
    requestLocation,
    setSchool,
    clearLocation,
  };
}
