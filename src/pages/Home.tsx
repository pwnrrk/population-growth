import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { getPopulations } from "../services/population";
import type Population from "../interfaces/population";
import { byCountry } from "country-code-lookup";
import AnimatedNumber from "../components/AnimatedNumber";
import Flag from "../components/Flag";

const numberFormat = new Intl.NumberFormat();

const START = 1950;
const MAX = 2021;
const DELTA_TIME_SCALE = 100000;
const TOTAL_YEARS = MAX - START;
const speedMultiplier = 5;

const regions: Record<string, string> = {
  Asia: "bg-violet-500",
  Europe: "bg-purple-500",
  Africa: "bg-orange-500",
  Oceania: "bg-amber-500",
  Americas: "bg-yellow-500",
};

export default function Home() {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const animationFrameId = useRef<number>(null);
  const [data, setData] = useState<Population[]>([]);
  const [_time, setTime] = useState(0);
  const [maxCountry] = useState(12);
  const year = useRef<number>(START);
  const indicator = useRef<HTMLDivElement>(null);
  const isFinished = year.current >= MAX;
  const lastTime = useRef(0);
  const fps = useRef<30 | 60>(60);
  const speed = useRef(1);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  function animate() {
    const timestamp = Date.now();
    const calculatedFPS = DELTA_TIME_SCALE / fps.current;
    const deltaTime = timestamp - lastTime.current;
    lastTime.current = timestamp;
    setTime(deltaTime);

    if (year.current && year.current >= MAX) return stopAnimation();
    year.current +=
      (deltaTime / calculatedFPS) * speed.current * speedMultiplier;
    const currentDiff = MAX - year.current!;
    const totalDiff = TOTAL_YEARS;
    const progress = ((totalDiff - currentDiff) / totalDiff) * 100;
    indicator.current!.style.transform = `translateX(${progress}%)`;
    animationFrameId.current = requestAnimationFrame(animate);
  }

  function startAnimation() {
    setIsRunning(true);
    lastTime.current = Date.now();
    animationFrameId.current = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    setIsRunning(false);
    cancelAnimationFrame(animationFrameId.current!);
  }

  function reset() {
    stopAnimation();
    indicator.current!.style.transform = "";
    year.current = START;
    setTime(Date.now());
    setSelectedRegion(null);
  }

  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  useEffect(() => {
    getPopulations().then((populations) => setData(populations));
  }, []);

  const dataInYear = data.filter(
    (row) => row.Year === Math.round(year.current)
  );

  dataInYear.sort((a, b) => b.Population - a.Population);

  const total = dataInYear[0]?.Population || 0;

  const topCountries = dataInYear
    .filter((row) => byCountry(row["Country name"]))
    .filter((row) =>
      selectedRegion
        ? selectedRegion === byCountry(row["Country name"])!.continent
        : true
    )
    .splice(0, maxCountry);

  const topCountryTotal = topCountries[0]?.Population || 0;

  function getPercentage(country: Population) {
    const { Population } = country;
    return (Population / topCountryTotal) * 100;
  }

  return (
    <main className="max-w-screen-lg m-auto p-4 text-gray-700">
      <div className="shadow rounded-2xl p-4 overflow-hidden relative">
        <h1 className="text-4xl/12 font-medium">
          {t("populationTitle")}, {START} to {MAX}
        </h1>
        <h3 className="text-xl mb-6">{t("clickOnLegendHint")}</h3>
        <div className="flex gap-2">
          <span className="font-bold">{t("region")}</span>
          {Object.keys(regions).map((key) => (
            <button
              key={key}
              className={clsx(
                "flex gap-2 items-center rounded cursor-pointer",
                selectedRegion === key && "font-medium"
              )}
              onClick={() => setSelectedRegion(key)}
            >
              <div className={clsx(regions[key], "size-4")}></div> {key}
            </button>
          ))}
        </div>
        <div className="relative h-[450px] mt-8 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-center py-4 font-medium text-gray-500">
          {topCountries.map((item, index) => {
            const countryInfo = byCountry(item["Country name"])!;
            return (
              <div
                key={item["Country name"]}
                className="grid grid-cols-[auto_1fr] gap-x-2 transition-all duration-500 col-span-full absolute top-[var(--top)] left-0 right-0"
                style={
                  {
                    "--top": `${index * 8}%`,
                  } as CSSProperties
                }
              >
                <div className="text-right min-w-32">
                  {item["Country name"]}
                </div>
                <div className="overflow-hidden h-8 relative">
                  <div className="absolute inset-0 flex items-center gap-1">
                    <div
                      className={clsx(
                        "w-[var(--percentage)] transition-all flex items-center px-0.5 justify-end ease-linear h-8",
                        regions[countryInfo.continent]
                      )}
                      style={
                        {
                          "--percentage": `${getPercentage(item)}%`,
                        } as CSSProperties
                      }
                    >
                      <Flag code={countryInfo.iso2} />
                    </div>
                    <span>
                      <AnimatedNumber
                        target={Math.round(item.Population)}
                        formatter={numberFormat.format}
                        fps={20}
                        shouldAnimate={isRunning}
                      />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-end text-gray-500 absolute right-10 bottom-40">
          <div className="text-7xl font-medium">{year.current?.toFixed(0)}</div>
          <div className="text-3xl">
            {t("total")}:{" "}
            <AnimatedNumber
              target={total}
              shouldAnimate={isRunning}
              fps={20}
              formatter={numberFormat.format}
            />
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
              <div className="absolute -top-5 -left-2 w-full" ref={indicator}>
                <span className="text-sm text-gray-400">&#9660;</span>
              </div>
              {Array.from(Array(TOTAL_YEARS)).map((_, index) => (
                <div className="text-center relative" key={index}>
                  <div
                    className={clsx(
                      "border-l-2 border-l-gray-300 h-1",
                      index % 4 === 0 && "h-2"
                    )}
                  ></div>
                  <div className="text-xs absolute text-gray-500 -translate-x-[50%] select-none">
                    {index % 4 === 0 && <span>{START + index}</span>}
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
      </div>
      <div className="p-4">
        <button onClick={reset} disabled={isRunning} className="underline">
          {t("reset")}
        </button>
      </div>
    </main>
  );
}
