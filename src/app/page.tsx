import { WorldMap } from "@/app/Map";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import { z } from "zod";
import { promises as fs } from "fs";
import { DEFAULT_LOCATION } from "@/app/constants";

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

const getData = unstable_cache(
  async (): Promise<{ current: Data; history: Array<Data> }> => {
    const file = await fs.readFile(
      process.cwd() + "/src/app/history.json",
      "utf8"
    );
    const history: Array<Data> = JSON.parse(file);

    if (!process.env.LOCATION) {
      return {
        history,
        current: DEFAULT_LOCATION,
      };
    }

    const currentLocationFromHistory = history.find(
      (item) => item.location === process.env.LOCATION
    );

    if (currentLocationFromHistory) {
      return {
        history: history.filter(
          (item) => item.location !== currentLocationFromHistory.location
        ),
        current: currentLocationFromHistory,
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
      * the number of hours of flight from Paris, rounded at the first superior integer`,
      schema: zData(),
    });

    const newValue = chatGptResponse.object;

    fs.writeFile(
      process.cwd() + "/src/app/history.json",
      JSON.stringify([...history, newValue], null, 2)
    );

    return { current: newValue, history };
  },
  [process.env.LOCATION ?? ""],
  { revalidate: 60 * 60 * 12 } // 60s * 60 * 12 = 12h
);

export default async function Home() {
  const data = await getData();

  const date = new Date();

  return (
    <main className="flex flex-col">
      <Suspense fallback={<p>Loading...</p>}>
        <div className="flex flex-col h-screen w-screen">
          <WorldMap
            position={data.current}
            history={data.history}
            isOut={!!process.env.LOCATION}
          />
          <div className="absolute right-0 top-0 p-4 text-lg text-slate-200 z-10">
            {date.getUTCHours() + data.current.timezoneOffset}h
            {date.getMinutes().toString().padStart(2, "0")} {data.current.flag}
          </div>
          <div className="absolute left-0 right-0 bottom-0 p-8 text-lg text-slate-200 z-10">
            <p className="bold">
              {data.current.hello} 👋{data.current.flag}
            </p>
            <p>
              I&apos;m currently{" "}
              <strong>
                {data.current.location ?? "not too far from home"}
              </strong>
            </p>
          </div>
        </div>
      </Suspense>
      {/* <div className="flex flex-col p-8 gap-4">
        <p>I&apos;m certainly doing one of this stuff:</p>
        <div className="flex grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.maybeDoing.map((data) => (
            <div
              key={data.label}
              className="flex flex-col flex-1 bg-white bg-opacity-20 p-4 rounded-md"
            >
              <p>{data.label}</p>
              <img alt={data.label} src={data.image} />
            </div>
          ))}
        </div>
      </div> */}
    </main>
  );
}
