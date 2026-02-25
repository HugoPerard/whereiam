import { WorldMap } from "@/app/Map";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import { z } from "zod";
import { readDb, writeDb, dbSchema, locationSchema, type Db } from "@/lib/db";
import { DEFAULT_LOCATION } from "@/app/constants";
import { InformationCard } from "@/components/InformationCard";
import { Topbar } from "@/components/Topbar";

export type Data = z.infer<typeof locationSchema>;
export type DataWithHistory = Data & { count: number; lastTime: number };
export type DataWithPartialHistory = Data &
  Partial<{ count: number; lastTime: number }>;

async function getDataUncached(): Promise<{
  current: DataWithPartialHistory;
  history: Array<DataWithHistory>;
}> {
  const db = await readDb();
  const location = process.env.LOCATION;

  if (!location) {
    if (db.last) {
      await writeDb({ last: null, history: db.history });
    }
    return {
      history: db.history,
      current: DEFAULT_LOCATION,
    };
  }

  const existing = db.history.find((item) => item.location === location);

  if (existing) {
    const historyWithoutCurrent = db.history.filter(
      (item) => item.location !== existing.location
    );
    const updated = {
      ...existing,
      count: existing.count + 1,
      lastTime: Date.now(),
    };

    if (db.last !== location) {
      await writeDb({
        last: location,
        history: [...historyWithoutCurrent, updated],
      });
    }

    return {
      history: historyWithoutCurrent,
      current: updated,
    };
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

  const newEntry = {
    ...object,
    count: 1,
    lastTime: Date.now(),
  };

  const newDb: Db = dbSchema.parse({
    last: location,
    history: [...db.history, newEntry],
  });
  await writeDb(newDb);

  return { current: newEntry, history: db.history };
}

const getData = unstable_cache(
  getDataUncached,
  [process.env.LOCATION ?? ""],
  { revalidate: 60 * 60 } // 1 hour
);

export default async function Home() {
  const data = await getData();

  return (
    <main className="flex flex-col">
      <Suspense fallback={<p>Loading...</p>}>
        <div className="flex flex-col h-screen w-screen">
          <WorldMap
            position={data.current}
            history={data.history}
            isOut={!!process.env.LOCATION}
          />
        </div>
        <Topbar />
        <InformationCard data={data} />
      </Suspense>
    </main>
  );
}
