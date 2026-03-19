import { WorldMap } from "@/app/Map";
import Galaxy from "@/components/Galaxy";
import { Suspense } from "react";
import { getData, type Location } from "@/lib/get-location";
import { Links } from "@/components/Links";
import { Metadata } from "next";

export type Data = Location;

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getData();
  const name = process.env.NAME ?? "prdHugo";
  const location = data.location.location ?? "Not far from home";
  const title = `${data.location.flag} ${location}`;
  const description = `${data.location.hello} from ${location} — Where is ${name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: `Where is ${name}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Home() {
  const data = await getData();

  return (
    <main className="relative min-h-screen bg-black">
      <div className="fixed inset-0 z-0 opacity-40">
        <Galaxy transparent />
      </div>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center text-white/60">
            Loading...
          </div>
        }
      >
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center">
          <div className="home-main relative z-10 flex w-full max-w-md flex-col items-center text-center">
            <div className="home-subtitle mb-1 flex flex-col gap-0.5 font-medium tracking-widest uppercase">
              <span className="text-xs">Where Is</span>
              <span>{process.env.NAME ?? "prdHugo"}</span>
            </div>
            <div className="relative h-[min(70vh,480px)] aspect-square w-full max-w-2xl overflow-hidden -my-8">
              <WorldMap
                position={data.data.location}
                avatarUrl={process.env.AVATAR_URL}
              />
            </div>
            <p className="home-title mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {data.data.location.location ?? "Not far from home"}
            </p>
            <div className="home-divider my-6 h-px w-12" />
            <Links />
          </div>
        </div>
      </Suspense>
    </main>
  );
}
