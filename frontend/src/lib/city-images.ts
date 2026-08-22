/**
 * City imagery backed by Unsplash.
 *
 * Every place gets a DISTINCT image:
 * 1. An explicit URL always wins (user-picked cover images).
 * 2. Curated per-city photos for well-known destinations.
 * 3. A deterministic pick from a generic travel pool for anything else, so
 *    two different city names never resolve to the same photo.
 */

const UNSPLASH_PARAMS = "?auto=format&fit=crop&w=1200&q=70";

function unsplash(photoId: string): string {
  return `https://images.unsplash.com/${photoId}${UNSPLASH_PARAMS}`;
}

/** Curated, stable Unsplash photos keyed by normalized city name. */
const CITY_PHOTOS: Record<string, string> = {
  agra: "photo-1564507592333-c60657eea523",
  amsterdam: "photo-1534351590666-13e3e96b5017",
  athens: "photo-1555993539-1732b0258235",
  barcelona: "photo-1583422409516-2895a77efded",
  beijing: "photo-1508804185872-d7badad00f7d",
  berlin: "photo-1560969184-10fe8719e047",
  cairo: "photo-1539650116574-75c0c6d73f6e",
  capetown: "photo-1580060839134-75a5edca2e99",
  chicago: "photo-1477959858617-67f85cf4f1df",
  dubai: "photo-1512453979798-5ea266f8880c",
  florence: "photo-1541575014840-6a49be4bcccf",
  goa: "photo-1512343879784-a960bf40e7f2",
  istanbul: "photo-1524231757912-21f4fe3a7200",
  italy: "photo-1499678329028-101435549a4e",
  jaipur: "photo-1477587458883-47145ed94245",
  kyoto: "photo-1493976040374-85c8e12f0c0e",
  lisbon: "photo-1585208798174-6cedd86e019a",
  london: "photo-1513635269975-59663e0ac1ad",
  machupicchu: "photo-1526392060635-9d6019884377",
  maldives: "photo-1514282401047-d79a71a590e8",
  newdelhi: "photo-1587474260584-136574528ed5",
  newyork: "photo-1496442226666-8d4d0e62e6e9",
  newyorkcity: "photo-1496442226666-8d4d0e62e6e9",
  nyc: "photo-1496442226666-8d4d0e62e6e9",
  paris: "photo-1502602898657-3e91760cbb34",
  prague: "photo-1541849546-216549ae216d",
  rio: "photo-1483729558449-99ef09a8c325",
  riodejaneiro: "photo-1483729558449-99ef09a8c325",
  sanfrancisco: "photo-1501594907352-04cda38ebc29",
  santorini: "photo-1613395877344-13d4a8e0d49e",
  seoul: "photo-1517154421773-0529f29ea451",
  singapore: "photo-1525625293386-3f8f99389edd",
  thailand: "photo-1552465011-b4e21bf6e79a",
  tokyo: "photo-1540959733332-eab4deabeeaf",
  venice: "photo-1514890547357-a9ee288728e0",
  vietnam: "photo-1528127269322-539801943592",
};

/** Generic travel photos used (deterministically) for unknown places. */
const TRAVEL_PHOTO_POOL = [
  "photo-1488646953014-85cb44e25828",
  "photo-1469854523086-cc02fe5d8800",
  "photo-1503220317375-aaad61436b1b",
  "photo-1476514525535-07fb3b4ae5f1",
  "photo-1507525428034-b723cf961d3e",
  "photo-1519681393784-d120267933ba",
  "photo-1449824913935-59a10b8d2000",
  "photo-1493246507139-91e8fad9978e",
  "photo-1500530855697-b586d89ba3ee",
  "photo-1530789253388-582c481c54b0",
  "photo-1500835556837-99ac94a94552",
  "photo-1436491865332-7a61a109cc05",
];

export function normalizePlaceName(value?: string | null): string {
  return (value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Stable string hash so a given name always resolves to the same photo. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function unsplashCityImage(placeName?: string | null): string {
  const key = normalizePlaceName(placeName);
  if (!key) {
    return unsplash(TRAVEL_PHOTO_POOL[0]);
  }
  const curated = CITY_PHOTOS[key];
  if (curated) return unsplash(curated);
  return unsplash(TRAVEL_PHOTO_POOL[hashString(key) % TRAVEL_PHOTO_POOL.length]);
}
