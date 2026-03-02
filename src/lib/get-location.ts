import { unstable_cache } from "next/cache";
import { readDb, writeDb } from "@/lib/db";
import { DEFAULT_DATA, DEFAULT_LOCATION } from "@/app/constants";
import { getCurrentCalendarLocation } from "@/lib/calendar";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { locationSchema } from "@/lib/db";
import type { Location } from "@/lib/db";

export type { Location };

async function getDataUncached(): Promise<{
  data: { location: Location; user: { name: string } };
}> {
  const db = await readDb();
  const calendarIcsUrl = process.env.CALENDAR_ICS?.trim() || null;
  let calendarLocation: Awaited<ReturnType<typeof getCurrentCalendarLocation>> =
    null;

  if (calendarIcsUrl) {
    try {
      calendarLocation = await getCurrentCalendarLocation(calendarIcsUrl);
    } catch (error) {
      console.error("Failed to resolve calendar location", error);
    }
  }

  const location = calendarLocation?.location ?? null;

  const user = { name: process.env.NAME ?? "prdHugo" };

  if (!location) {
    if (db.current) {
      await writeDb({ current: null });
    }
    return { data: { location: DEFAULT_LOCATION, user } };
  }

  const cached = db.current;
  if (cached?.location === location) {
    return { data: { location: cached, user } };
  }

  const { object } = await generateObject({
    model: openai("gpt-4"),
    schema: locationSchema,
    prompt: `I'm currently in this place "${location}" and I need to share some stuff about this place and what I'm doing, so please give me :
* the given location
* the flag emoji of the country of the place
* the translate of "Hello" in the main language of the place
* the local timezone offset for today, the ${new Date().toISOString()}, taking care of time changes, I mean in the current timezone is UTC +2 give me 2, if it UTC -6 give me -6
* the longitude and the latitude of the place.
* an integer that is a rounded at the first superior of hours of flight time from Paris`,
    providerOptions: {
      openai: { strictJsonSchema: true },
    },
  });

  await writeDb({ current: object });

  return { data: { location: object, user } };
}

export const getData = unstable_cache(
  getDataUncached,
  [process.env.CALENDAR_ICS ?? ""],
  { revalidate: 60 * 5 }, // 5 minutes
);

/** Lightweight read for share preview - avoids AI/calendar calls */
export async function getLocationForShare(): Promise<{
  location: Location;
  user: { name: string };
}> {
  try {
    const db = await readDb();
    return {
      location: db.current ?? DEFAULT_LOCATION,
      user: { name: process.env.NAME ?? "prdHugo" },
    };
  } catch {
    return DEFAULT_DATA;
  }
}
