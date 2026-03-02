type CalendarEvent = {
  start: Date;
  end: Date;
  location: string | null;
  summary: string | null;
  status: string | null;
};

type EventDraft = Partial<CalendarEvent> & {
  startTzid?: string;
  endTzid?: string;
};

const ICS_LINE_BREAK = /\r?\n/;

function unfoldIcsLines(content: string): string[] {
  const lines = content.split(ICS_LINE_BREAK);
  const unfolded: string[] = [];

  for (const line of lines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += line.slice(1);
      continue;
    }
    unfolded.push(line);
  }

  return unfolded;
}

function parseIcsText(value: string): string {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const entries = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  const asUtc = Date.UTC(
    Number(entries.year),
    Number(entries.month) - 1,
    Number(entries.day),
    Number(entries.hour),
    Number(entries.minute),
    Number(entries.second)
  );

  return asUtc - date.getTime();
}

function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const offset = getTimeZoneOffsetMs(new Date(utcGuess), timeZone);
  return new Date(utcGuess - offset);
}

function parseIcsDate(rawValue: string, tzid?: string): Date | null {
  const value = rawValue.trim();
  if (!value) return null;

  const allDay = /^(\d{4})(\d{2})(\d{2})$/.exec(value);
  if (allDay) {
    const [, year, month, day] = allDay;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0));
  }

  const dateTimeUtc = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(value);
  if (dateTimeUtc) {
    const [, year, month, day, hour, minute, second] = dateTimeUtc;
    return new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
      )
    );
  }

  const dateTime = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/.exec(value);
  if (dateTime) {
    const [, year, month, day, hour, minute, second] = dateTime;
    if (tzid) {
      return zonedDateTimeToUtc(
        Number(year),
        Number(month),
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
        tzid
      );
    }
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
  }

  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function parseEventLine(line: string): { key: string; value: string; tzid?: string } | null {
  const separatorIndex = line.indexOf(":");
  if (separatorIndex === -1) return null;

  const left = line.slice(0, separatorIndex);
  const value = line.slice(separatorIndex + 1);
  const [rawKey, ...rawParams] = left.split(";");

  let tzid: string | undefined;
  for (const param of rawParams) {
    const [paramKey, ...rest] = param.split("=");
    if (paramKey.toUpperCase() === "TZID" && rest.length > 0) {
      tzid = rest.join("=");
    }
  }

  return { key: rawKey.toUpperCase(), value, tzid };
}

function parseIcsEvents(icsContent: string): CalendarEvent[] {
  const lines = unfoldIcsLines(icsContent);
  const events: CalendarEvent[] = [];
  let currentEvent: EventDraft | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      currentEvent = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (currentEvent?.start && currentEvent.end) {
        events.push({
          start: currentEvent.start,
          end: currentEvent.end,
          location: currentEvent.location ?? null,
          summary: currentEvent.summary ?? null,
          status: currentEvent.status ?? null,
        });
      }
      currentEvent = null;
      continue;
    }
    if (!currentEvent) continue;

    const parsedLine = parseEventLine(line);
    if (!parsedLine) continue;

    switch (parsedLine.key) {
      case "DTSTART": {
        const d = parseIcsDate(parsedLine.value, parsedLine.tzid);
        currentEvent.start = d ?? undefined;
        currentEvent.startTzid = parsedLine.tzid;
        break;
      }
      case "DTEND": {
        const d = parseIcsDate(parsedLine.value, parsedLine.tzid);
        currentEvent.end = d ?? undefined;
        currentEvent.endTzid = parsedLine.tzid;
        break;
      }
      case "LOCATION":
        currentEvent.location = parseIcsText(parsedLine.value) || null;
        break;
      case "SUMMARY":
        currentEvent.summary = parseIcsText(parsedLine.value) || null;
        break;
      case "STATUS":
        currentEvent.status = parseIcsText(parsedLine.value) || null;
        break;
      default:
        break;
    }
  }

  return events;
}

export async function getCurrentCalendarLocation(
  calendarIcsUrl: string,
  now: Date = new Date()
): Promise<{ location: string | null; startsAt: Date; endsAt: Date } | null> {
  console.log("[calendar] Fetching ICS", {
    url: calendarIcsUrl,
    now: now.toISOString(),
  });

  const response = await fetch(calendarIcsUrl, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    console.error("[calendar] ICS fetch failed", {
      status: response.status,
      statusText: response.statusText,
    });
    throw new Error(`Unable to fetch CALENDAR_ICS (${response.status})`);
  }

  const icsContent = await response.text();
  const parsedEvents = parseIcsEvents(icsContent);
  const events = parsedEvents.filter(
    (event) =>
      event.status?.toUpperCase() !== "CANCELLED" &&
      event.start.getTime() <= now.getTime() &&
      now.getTime() < event.end.getTime()
  );

  console.log("[calendar] ICS parsed", {
    totalEvents: parsedEvents.length,
    activeEvents: events.length,
  });

  if (events.length === 0) {
    console.log("[calendar] No active event found");
    return null;
  }

  const currentEvent = [...events].sort(
    (eventA, eventB) => eventB.start.getTime() - eventA.start.getTime()
  )[0];
  const resolvedLocation = currentEvent.location ?? currentEvent.summary ?? null;

  console.log("[calendar] Active event selected", {
    location: resolvedLocation,
    startsAt: currentEvent.start.toISOString(),
    endsAt: currentEvent.end.toISOString(),
  });

  return {
    location: resolvedLocation,
    startsAt: currentEvent.start,
    endsAt: currentEvent.end,
  };
}
