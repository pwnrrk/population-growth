import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { add, format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const numberFormat = new Intl.NumberFormat();

const START = 1950;
const MAX = 2021;

const TOTAL_YEARS = MAX - START;

const startDate = new Date(START, 1, 1);

export default function Home() {
  const { t } = useTranslation();
  const [date, setDate] = useState(startDate);
  const [total, setTotal] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const animationFrameId = useRef<number>(null);
  const startTime = useRef<number>(null);
  const year = useRef<number>(null);
  const indicator = useRef<HTMLDivElement>(null);
  const isFinished = date.getFullYear() >= MAX;

  function animate(timestamp: number) {
    if (year.current && year.current >= MAX) return stopAnimation();

    if (!startTime.current) {
      startTime.current = timestamp;
    }

    setTotal((old) => old + 1);
    setDate((old) => {
      const newState = add(old, { days: 30 });
      year.current = newState.getFullYear();
      return newState;
    });

    const currentDiff = MAX - year.current!;
    const totalDiff = TOTAL_YEARS;
    const progress = ((totalDiff - currentDiff) / totalDiff) * 100;

    indicator.current!.style.transform = `translateX(${progress + 1}%)`;

    animationFrameId.current = requestAnimationFrame(animate);
  }

  function startAnimation() {
    setIsRunning(true);
    startTime.current = null;
    animationFrameId.current = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    setIsRunning(false);
    cancelAnimationFrame(animationFrameId.current!);
  }

  function reset() {
    stopAnimation();
    setDate(startDate);
    setTotal(0);
    indicator.current!.style.transform = "";
    year.current = START;
  }

  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <main className="max-w-screen-lg m-auto p-4">
      <div className="shadow rounded-2xl p-4 overflow-hidden">
        <h1 className="text-4xl/12 font-medium">{t("populationTitle")}</h1>
        <h3 className="text-xl mb-6">{t("clickOnLegendHint")}</h3>
        <div>
          <span className="font-bold">{t("region")}</span>
        </div>
        <div className="text-end text-gray-500">
          <div className="text-6xl font-medium">{format(date, "yyyy")}</div>
          <div className="text-2xl">
            {t("total")}: {numberFormat.format(total)}
          </div>
        </div>
        <div className="py-4"></div>
        <div>
          <div className="flex gap-4 items-center">
            <button
              onClick={isRunning ? stopAnimation : startAnimation}
              disabled={isFinished}
              className="rounded-full size-12 p-1 hover:bg-black/5 mb-8 text-gray-700"
            >
              {isRunning ? <PauseCircleIcon /> : <PlayCircleIcon />}
            </button>
            <div className="flex justify-between pb-4 flex-1 border-t-2 border-t-gray-300 relative">
              <div
                className="absolute -top-4 -left-2 w-full transition"
                ref={indicator}
              >
                <ChevronDownIcon className="size-4" />
              </div>
              {Array.from(Array(TOTAL_YEARS)).map((_, index) => (
                <div className="text-center relative" key={index}>
                  <div
                    className={clsx(
                      "border-l-2 border-l-gray-300 h-1",
                      index % 5 === 0 && "h-2"
                    )}
                  ></div>
                  <div className="text-xs absolute text-gray-500 -translate-x-[50%]">
                    {index % 5 === 0 && <span>{START + index}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-gray-500">
          {t("source")}:{" "}
          <a href="" className="underline">
            {t("ourWorldName")}
          </a>
        </div>
        <button onClick={reset} disabled={isRunning} className="underline">
          {t("reset")}
        </button>
      </div>
    </main>
  );
}
