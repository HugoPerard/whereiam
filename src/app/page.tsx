import { WorldMap } from "@/app/Map";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import { z } from "zod";
import { readDb, writeDb, locationSchema } from "@/lib/db";
import { DEFAULT_LOCATION } from "@/app/constants";
import { Links } from "@/components/Links";
import { getCurrentCalendarLocation } from "@/lib/calendar";

export type Data = z.infer<typeof locationSchema>;

async function getDataUncached(): Promise<{ current: Data }> {
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

  if (!location) {
    if (db.current) {
      await writeDb({ current: null });
    }
    return { current: DEFAULT_LOCATION };
  }

  const cached = db.current;
  if (cached?.location === location) {
    return { current: cached };
  }

  const { object } = await generateObject({
    model: openai("gpt-4"),
    prompt: `I'm currently in this place "${location}" and I need to share some stuff about this place and what I'm doing, so please give me :
* the given location
* the flag emoji of the country of the place
* the translate of "Hello" in the main language of the place
* the local timezone offset for today, the ${new Date().toISOString()}, taking care of time changes, I mean in the current timezone is UTC +2 give me 2, if it UTC -6 give me -6
* the longitude and the latitude of the place.
* an integer that is a rounded at the first superior of hours of flight time from Paris`,
    schema: locationSchema,
  });

  const newEntry: Data = { ...object };
  await writeDb({ current: newEntry });

  return { current: newEntry };
}

const getData = unstable_cache(
  getDataUncached,
  [process.env.CALENDAR_ICS ?? ""],
  { revalidate: 60 * 5 }, // 5 minutes
);

export default async function Home() {
  const data = await getData();

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-black">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-white/60">
            Loading...
          </div>
        }
      >
        <div className="flex h-full min-h-0 flex-col items-center justify-center overflow-hidden">
          <div className="home-main relative z-10 flex w-full max-w-md flex-1 flex-col items-center justify-center gap-0 overflow-hidden px-4 text-center">
            <div className="home-subtitle mb-0.5 flex shrink-0 flex-col gap-0 text-sm font-medium tracking-widest uppercase">
              <span className="text-xs">Where Is</span>
              <span>{process.env.NAME ?? "prdHugo"}</span>
            </div>
            <div className="relative aspect-square w-full max-w-2xl flex-1 min-h-0 overflow-hidden">
              <WorldMap position={data.current} />
            </div>
            <p className="home-title mt-1 shrink-0 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {data.current.location ?? "Not far from home"}
            </p>
            <p className="home-subtitle mt-0.5 shrink-0 text-sm">
              {data.current.hello} 👋 {data.current.flag}
            </p>
            <div className="home-divider my-3 shrink-0 h-px w-12" />
            <Links />
          </div>
        </div>
      </Suspense>
    </main>
  );
}
