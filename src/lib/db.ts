import { promises as fs } from "fs";
import { z } from "zod";

const DB_PATH = "/db.json";

export const locationSchema = z.object({
  location: z.string().nullable(),
  flag: z.string(),
  hello: z.string(),
  timezoneOffset: z.number(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }),
  flightTime: z.number().nullable(),
  avatarPath: z.string().optional(),
});

const cacheSchema = z.object({
  current: locationSchema.nullable(),
});

const legacyDbSchema = z.object({
  last: z.string().nullable(),
  history: z.array(
    locationSchema.merge(
      z.object({ count: z.number().default(1), lastTime: z.number() })
    )
  ),
});

export type Location = z.infer<typeof locationSchema>;
export type Cache = z.infer<typeof cacheSchema>;

const dbPath = () => process.cwd() + DB_PATH;

function migrateLegacy(data: unknown): Cache {
  const parsed = legacyDbSchema.safeParse(data);
  if (!parsed.success) {
    return { current: null };
  }
  const { last, history } = parsed.data;
  if (!last) {
    return { current: null };
  }
  const match = history.find((item) => item.location === last);
  if (!match) {
    return { current: null };
  }
  return {
    current: {
      location: match.location,
      flag: match.flag,
      hello: match.hello,
      timezoneOffset: match.timezoneOffset,
      coordinates: match.coordinates,
      flightTime: match.flightTime,
    },
  };
}

export async function readDb(): Promise<Cache> {
  try {
    const raw = await fs.readFile(dbPath(), "utf8");
    const data = JSON.parse(raw);
    const parsed = cacheSchema.safeParse(data);
    if (parsed.success) {
      return parsed.data;
    }
    const migrated = migrateLegacy(data);
    await writeDb(migrated);
    return migrated;
  } catch (err) {
    const nodeErr = err as NodeJS.ErrnoException;
    if (nodeErr?.code === "ENOENT") {
      return { current: null };
    }
    throw err;
  }
}

export async function writeDb(cache: Cache): Promise<void> {
  await fs.writeFile(dbPath(), JSON.stringify(cache, null, 2), "utf8");
}
