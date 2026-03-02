import type { Location } from "@/lib/db";

export const DEFAULT_LOCATION: Location = {
  location: null,
  flag: "🇫🇷",
  hello: "Bonjour",
  timezoneOffset: 1,
  coordinates: { lat: 49.439999, lng: 1.1 },
  flightTime: null,
};
