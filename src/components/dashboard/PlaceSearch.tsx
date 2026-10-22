import { Loader2, MapPin, Navigation, Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { Coordinates } from "@/hooks/use-prayer-times";

// Recherche de ville (Open-Meteo Geocoding) et mosquées proches (Photon,
// données OpenStreetMap). Services gratuits, sans clé (décision du 2026-10-22).

type City = { id: number; name: string; detail: string; coordinates: Coordinates };
type Mosque = { id: string; name: string; address: string; distanceKm: number; coordinates: Coordinates };

function distanceKm(a: Coordinates, b: Coordinates) {
  const rad = (value: number) => (value * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_id: number;
    osm_type: string;
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
  };
};

async function searchMosques(center: Coordinates, signal: AbortSignal): Promise<Mosque[]> {
  const queries = ["mosquée", "mosque", "masjid"];
  const responses = await Promise.all(
    queries.map(async (query) => {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${center.latitude}&lon=${center.longitude}&limit=15&osm_tag=amenity:place_of_worship`;
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error("Le service des lieux ne répond pas.");
      return ((await response.json()) as { features: PhotonFeature[] }).features;
    }),
  );
  const seen = new Set<string>();
  return responses
    .flat()
    .filter((feature) => {
      const key = `${feature.properties.osm_type}${feature.properties.osm_id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((feature) => {
      const coordinates = {
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
      };
      const { street, housenumber, city, name } = feature.properties;
      return {
        id: `${feature.properties.osm_type}${feature.properties.osm_id}`,
        name: name || "Mosquée",
        address: [[housenumber, street].filter(Boolean).join(" "), city].filter(Boolean).join(", "),
        distanceKm: distanceKm(center, coordinates),
        coordinates,
      };
    })
    .filter((mosque) => mosque.distanceKm <= 25)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 8);
}

export function PlaceSearch({
  coordinates,
  onSetPlace,
}: {
  coordinates: Coordinates | null;
  onSetPlace: (coordinates: Coordinates, label: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [mosques, setMosques] = useState<Mosque[] | null>(null);
  const [isSearchingMosques, setIsSearchingMosques] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recherche de ville, 350 ms après la dernière frappe.
  useEffect(() => {
    const name = query.trim();
    if (name.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setIsSearchingCity(true);
      fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=fr&format=json`,
        { signal: controller.signal },
      )
        .then((response) => {
          if (!response.ok) throw new Error();
          return response.json() as Promise<{
            results?: { id: number; name: string; latitude: number; longitude: number; admin1?: string; country?: string }[];
          }>;
        })
        .then((data) => {
          setCities(
            (data.results ?? []).map((result) => ({
              id: result.id,
              name: result.name,
              detail: [result.admin1, result.country].filter(Boolean).join(", "),
              coordinates: { latitude: result.latitude, longitude: result.longitude },
            })),
          );
          setError(null);
        })
        .catch(() => {
          if (!controller.signal.aborted) setError("La recherche de ville ne répond pas. Réessaie.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsSearchingCity(false);
        });
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const findMosques = () => {
    if (!coordinates) return;
    const controller = new AbortController();
    setIsSearchingMosques(true);
    setError(null);
    searchMosques(coordinates, controller.signal)
      .then(setMosques)
      .catch(() => setError("La recherche de mosquées ne répond pas. Réessaie."))
      .finally(() => setIsSearchingMosques(false));
  };

  const visibleCities = query.trim().length >= 2 ? cities : [];

  return (
    <div className="space-y-5">
      <div>
        <label className="relative block">
          <span className="text-[13px] font-semibold">Choisir une ville</span>
          <Search className="pointer-events-none absolute bottom-3.5 left-3 size-4 text-(--n-muted)" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex. Lyon, Bruxelles, Casablanca…"
            className="n-input mt-1 pl-9!"
            autoComplete="off"
          />
        </label>
        {isSearchingCity && (
          <p className="mt-2 flex items-center gap-2 text-[13px] text-(--n-muted)" role="status">
            <Loader2 className="size-3.5 animate-spin" /> Recherche…
          </p>
        )}
        {visibleCities.length > 0 && (
          <ul className="n-place-list mt-2">
            {visibleCities.map((city) => (
              <li key={city.id}>
                <button
                  type="button"
                  className="n-place-item"
                  onClick={() => {
                    onSetPlace(city.coordinates, city.name);
                    setQuery("");
                    setCities([]);
                    setMosques(null);
                  }}
                >
                  <MapPin className="size-4 shrink-0 text-(--n-sage)" />
                  <span className="min-w-0">
                    <span className="block font-semibold">{city.name}</span>
                    <span className="block truncate text-[13px] text-(--n-muted)">{city.detail}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-(--n-line) pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] font-semibold">Mosquées proches</p>
          <button
            type="button"
            className="n-btn n-btn-ghost px-4! py-2! text-sm! disabled:opacity-40"
            disabled={!coordinates || isSearchingMosques}
            onClick={findMosques}
          >
            {isSearchingMosques ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            {mosques ? "Actualiser" : "Chercher"}
          </button>
        </div>
        {!coordinates && (
          <p className="mt-2 text-[13px] text-(--n-muted)">
            Active ta position ou choisis une ville d’abord.
          </p>
        )}
        {mosques && mosques.length === 0 && (
          <p className="mt-3 text-[14px] text-(--n-muted)">Aucune mosquée référencée à moins de 25 km.</p>
        )}
        {mosques && mosques.length > 0 && (
          <ul className="n-place-list mt-3">
            {mosques.map((mosque) => (
              <li key={mosque.id} className="n-place-row">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{mosque.name}</span>
                  <span className="block truncate text-[13px] text-(--n-muted)">
                    {mosque.distanceKm < 1
                      ? `${Math.round(mosque.distanceKm * 1000)} m`
                      : `${mosque.distanceKm.toFixed(1).replace(".", ",")} km`}
                    {mosque.address && ` · ${mosque.address}`}
                  </span>
                </span>
                <a
                  className="n-icon-btn shrink-0"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${mosque.coordinates.latitude},${mosque.coordinates.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Itinéraire vers ${mosque.name}`}
                  title="Itinéraire"
                >
                  <Navigation className="size-4" />
                </a>
                <button
                  type="button"
                  className="n-link shrink-0 text-[13px]"
                  onClick={() => onSetPlace(mosque.coordinates, mosque.name)}
                >
                  Horaires ici
                </button>
              </li>
            ))}
          </ul>
        )}
        {mosques && (
          <p className="mt-3 text-[12px] leading-5 text-(--n-muted)">
            Mosquées référencées sur OpenStreetMap, liste parfois incomplète. « Horaires ici »
            calcule les horaires pour l’emplacement de la mosquée : ce ne sont pas les horaires
            affichés par la mosquée. Données ©{" "}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">
              OpenStreetMap
            </a>
            .
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-[14px] text-[#b4473a]">
          {error}
        </p>
      )}
    </div>
  );
}
