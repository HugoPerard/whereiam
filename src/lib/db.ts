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
});

export const historyItemSchema = locationSchema.merge(
  z.object({ count: z.number().default(1), lastTime: z.number() })
);

export const dbSchema = z.object({
  last: z.string().nullable(),
  history: z.array(historyItemSchema),
});

export type Location = z.infer<typeof locationSchema>;
export type HistoryItem = z.infer<typeof historyItemSchema>;
export type Db = z.infer<typeof dbSchema>;

const dbPath = () => process.cwd() + DB_PATH;

export async function readDb(): Promise<Db> {
  const raw = await fs.readFile(dbPath(), "utf8");
  const parsed = dbSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error("Invalid db.json schema", { cause: parsed.error });
  }
  return parsed.data;
}

export async function writeDb(db: Db): Promise<void> {
  await fs.writeFile(dbPath(), JSON.stringify(db, null, 2), "utf8");
}
