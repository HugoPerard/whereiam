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

  const lastVisited = data.history.sort(
    (placeA, placeB) => (placeB.lastTime ?? 0) - (placeA.lastTime ?? 0)
  )?.[0];

  const isFirstVisit = data.current.location && (data.current.count ?? 0) <= 1;
  const countCurrentVisitText = isFirstVisit
    ? "for the first time!"
    : `again! (I've already been here ${(data.current.count ?? 1) - 1} times)`;

  return (
    <div className="absolute z-10 left-0 bottom-0 right-0 md:right-auto p-4 text-lg text-start rounded-t-md md:rounded-md md:m-2 border-gray-200 border-2 bg-white bg-opacity-50 text-gray-800 shadow-lg">
      <div className="flex justify-between">
        <p className="font-medium">
          {data.current.hello} 👋{data.current.flag}
        </p>
        <p className="font-medium">
          {date.getUTCHours() + data.current.timezoneOffset}h
          {date.getMinutes().toString().padStart(2, "0")}
        </p>
      </div>
      <p>
        I&apos;m currently{" "}
        <strong>
          {data.current.location
            ? `in ${data.current.location}`
            : "at home, or not too far."}
        </strong>
        {!!data.current.location && ` ${countCurrentVisitText}`}
      </p>
      <Collapsible>
        <CollapsibleTrigger>
          <p className="flex text-xs gap-4 justify-center items-center mt-2 underline">
            See more
          </p>
        </CollapsibleTrigger>
        <CollapsibleContent className="text-cyan-900">
          <div>
            <p className="font-medium text-sm">
              Destinations count:{" "}
              <strong>{data.history.length + (isFirstVisit ? 1 : 0)}</strong>
            </p>
            <p className="font-medium text-sm">
              Most visited destination:{" "}
              <strong>
                {`${mostVisited.location} ${mostVisited.flag}`} •{" "}
                {mostVisited.count} times
              </strong>
            </p>
            {!data.current.location && (
              <p className="font-medium text-sm">
                Last destination:{" "}
                <strong>{`${lastVisited.location} ${
                  lastVisited.flag
                } • ${new Date(lastVisited.lastTime).toDateString()}`}</strong>
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
