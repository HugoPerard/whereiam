import { WorldMap } from "@/app/Map";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import { z } from "zod";

const zData = () =>
  z.object({
    flag: z.string(),
    hello: z.string(),
    timezoneOffset: z.number(),
    location: z.object({ lat: z.number(), lng: z.number() }),
    maybeDoing: z.array(z.object({ image: z.string(), label: z.string() })),
  });
export type Data = z.infer<ReturnType<typeof zData>>;

const getData = unstable_cache(
  async (): Promise<Data> => {
    if (process.env.LOCALIZATION) {
      const chatGptResponse = await generateObject({
        model: openai("gpt-4"),
        prompt: `I'm currently in this place "${
          process.env.LOCALIZATION
        }" and I need to share some stuff about this place and what I'm doing, so please give me :
      * the flag of the country of the place
      * the translate of "Hello" in the main language of the place
      * the local timezone offset for today, the ${new Date().toISOString()}, taking care of time changes, I mean in the current timezone is UTC +2 give me 2, if it UTC -6 give me -6
      * the longitude and the latitude of the place.
      * Taking part of most popular things of the place, but also taking part that I'm a front web developer, that I love football, video games, drink beers with friend and travel, give me 3 things (a short label and a valid image url to illustrate) that I might be doing in this place.`,
        schema: zData(),
      });

      return chatGptResponse.object;
    }

    return {
      flag: "🇫🇷",
      hello: "Bonjour",
      timezoneOffset: 1,
      location: { lat: 49.439999, lng: 1.1 },
      maybeDoing: [
        { image: "/avatar.jpg", label: "Chilling 🎮📺🛋️" },
        { image: "/avatar.jpg", label: "Playing football ⚽" },
        { image: "/avatar.jpg", label: "Drinking some beers 🍻" },
      ],
    };
  },
  [process.env.LOCALIZATION ?? ""],
  { revalidate: 60 * 60 * 12 } // 60s * 60 * 12 = 12h
);

export default async function Home() {
  const data = await getData();

  const date = new Date();

  return (
    <main className="flex flex-col">
      <Suspense fallback={<p>Loading...</p>}>
        <div className="flex flex-col h-screen w-screen">
          <WorldMap position={data.location} />
          <div className="absolute right-0 top-0 p-4 text-lg text-slate-200 z-10">
            {date.getUTCHours() + data.timezoneOffset}h
            {date.getMinutes().toString().padStart(2, "0")} {data.flag}
          </div>
          <div className="absolute left-0 right-0 bottom-0 p-8 text-lg text-slate-200 z-10">
            <p className="bold">
              {data.hello} 👋{data.flag}
            </p>
            <p>
              I&apos;m currently{" "}
              <strong>
                {process.env.LOCALIZATION
                  ? `here, ${process.env.LOCALIZATION}`
                  : "not too far from home"}
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
