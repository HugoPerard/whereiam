import { DataWithHistory, DataWithPartialHistory } from "@/app/page";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";

export const InformationCard = ({
  data,
}: {
  data: { current: DataWithPartialHistory; history: Array<DataWithHistory> };
}) => {
  const date = new Date();

  const mostVisited = [...data.history, data.current].sort(
    (placeA, placeB) => (placeB.count ?? 0) - (placeA.count ?? 0)
  )?.[0];

  const lastVisited = [...data.history].sort(
    (placeA, placeB) => (placeB.lastTime ?? 0) - (placeA.lastTime ?? 0)
  )?.[0];

  const isFirstVisit = data.current.location && (data.current.count ?? 0) <= 1;
  const countCurrentVisitText = isFirstVisit
    ? "for the first time!"
    : `again! (I've already been here ${(data.current.count ?? 1) - 1} times)`;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 md:left-auto md:right-8 md:bottom-8 md:max-w-sm">
      <div className="backdrop-blur-xl border border-white/10 bg-slate-900/70 p-4 text-slate-100 shadow-xl rounded-t-2xl md:rounded-2xl ring-1 ring-white/5">
        <div className="flex justify-between items-center">
          <p className="font-medium text-lg">
            {data.current.hello} 👋 {data.current.flag}
          </p>
          <p className="font-mono text-sm tabular-nums text-slate-400">
            {date.getUTCHours() + data.current.timezoneOffset}h
            {date.getMinutes().toString().padStart(2, "0")}
          </p>
        </div>
        <p className="mt-1 text-slate-300">
          I&apos;m currently{" "}
          <strong className="font-semibold text-white">
            {data.current.location
              ? `in ${data.current.location}`
              : "at home, or not too far."}
          </strong>
          {!!data.current.location && (
            <span className="text-slate-400"> {countCurrentVisitText}</span>
          )}
        </p>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <button className="mt-3 w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-1.5 rounded hover:bg-white/5 -mx-2 px-2">
              See more stats
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5 text-sm text-slate-400">
              <p>
                Destinations:{" "}
                <strong className="text-slate-200">
                  {data.history.length + (isFirstVisit ? 1 : 0)}
                </strong>
              </p>
              <p>
                Most visited:{" "}
                <strong className="text-slate-200">
                  {`${mostVisited.location} ${mostVisited.flag}`} •
                  {mostVisited.count}×
                </strong>
              </p>
              {!data.current.location && lastVisited && (
                <p>
                  Last:{" "}
                  <strong className="text-slate-200">
                    {`${lastVisited.location} ${lastVisited.flag}`} •
                    {new Date(lastVisited.lastTime).toDateString()}
                  </strong>
                </p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};
