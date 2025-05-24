import * as all from "country-flag-icons/react/3x2";

const flags: Record<string, all.FlagComponent> = all;

export default function Flag({ code }: { code: string }) {
  const Component = flags[code];
  return (
    <div className="size-7 rounded-full relative overflow-hidden">
      <Component className="w-10 h-10 top-[50%] left-[50%] translate-[-50%] bottom-0 scale-110 absolute" />
    </div>
  );
}
