import { WorldMap } from "@/app/Map";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import { z } from "zod";
import { promises as fs } from "fs";
import { DEFAULT_LOCATION } from "@/app/constants";
import { InformationCard } from "@/components/InformationCard";
import { Topbar } from "@/components/Topbar";

const zData = () =>
  z.object({
    location: z.string().nullable(),
    flag: z.string(),
    hello: z.string(),
    timezoneOffset: z.number(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }),
    flightTime: z.number().nullable(),

    // maybeDoing: z.array(z.object({ image: z.string(), label: z.string() })),
  });
export type Data = z.infer<ReturnType<typeof zData>>;

export type DataWithHistory = Data & { count: number; lastTime: number };
export type DataWithPartialHistory = Data &
  Partial<{ count: number; lastTime: number }>;

const zDb = () =>
  z.object({
    last: z.string().nullable(),
    history: z.array(
      zData().merge(
        z.object({ count: z.number().default(1), lastTime: z.number() })
      )
    ),
  });
export type Db = z.infer<ReturnType<typeof zDb>>;

const DB_PATH = "/db.json";

const getData = unstable_cache(
  async (): Promise<{
    current: DataWithPartialHistory;
    history: Array<DataWithHistory>;
  }> => {
    const file = await fs.readFile(process.cwd() + DB_PATH, "utf8");

    const dbParsed = zDb().safeParse(JSON.parse(file));

    if (!dbParsed.success) {
      throw new Error("Error while parsing the db", dbParsed.error);
    }

    const db = dbParsed.data;

    if (!process.env.LOCATION) {
      if (!db.last) {
        return {
          history: db.history,
          current: DEFAULT_LOCATION,
        };
      }

      fs.writeFile(
        process.cwd() + DB_PATH,
        JSON.stringify(
          zDb().parse({
            last: null,
            history: db.history,
          }),
          null,
          2
        )
      );
    }

    const currentLocationFromHistory = db.history.find(
      (item) => item.location === process.env.LOCATION
    );

    if (currentLocationFromHistory) {
      const historyWithoutCurrent = db.history.filter(
        (item) => item.location !== currentLocationFromHistory.location
      );

      if (db.last === process.env.LOCATION) {
        return {
          history: historyWithoutCurrent,
          current: currentLocationFromHistory,
        };
      }

      const updatedCurrent = {
        ...currentLocationFromHistory,
        count: currentLocationFromHistory.count + 1,
        lastTime: new Date().getTime(),
      };
      fs.writeFile(
        process.cwd() + DB_PATH,
        JSON.stringify(
          zDb().parse({
            last: process.env.LOCATION,
            history: [...historyWithoutCurrent, updatedCurrent],
          }),
          null,
          2
        )
      );
      return {
        history: historyWithoutCurrent,
        current: updatedCurrent,
      };
    }

    const chatGptResponse = await generateObject({
      model: openai("gpt-4"),
      prompt: `I'm currently in this place "${
        process.env.LOCATION
      }" and I need to share some stuff about this place and what I'm doing, so please give me :
      * the given location 
      * the flag emoji of the country of the place
      * the translate of "Hello" in the main language of the place
      * the local timezone offset for today, the ${new Date().toISOString()}, taking care of time changes, I mean in the current timezone is UTC +2 give me 2, if it UTC -6 give me -6
      * the longitude and the latitude of the place.
      * an integer that is a rounded at the first superior of hours of flight time from Paris`,
      schema: zData(),
    });

    const newValue = {
      ...chatGptResponse.object,
      count: 1,
      lastTime: new Date().getTime(),
    };

    fs.writeFile(
      process.cwd() + DB_PATH,
      JSON.stringify(
        zDb().parse({
          last: process.env.LOCATION,
          history: [...db.history, newValue],
        }),
        null,
        2
      )
    );

    return { current: newValue, history: db.history };
  },
  [process.env.LOCATION ?? ""],
  { revalidate: 60 * 60 * 12 } // 60s * 60 * 12 = 12h
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
