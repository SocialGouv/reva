import { Title } from "../../atoms/Title";

type Size = "small" | "large";

interface Props {
  progress: number;
  size?: Size;
  title: string;
}

export const ProgressTitle = ({ progress, size = "small", title }: Props) => {
  return (
    <>
      <div className="flex items-end justify-between">
        <Title label={title} size={size} />
        <div className="font-semibold text-base text-slate-400">
          {progress}%
        </div>
      </div>
      <div className="mt-2 w-full bg-slate-300 rounded-full h-[5px]">
        <div
          className={`${
            size == "small" ? "bg-blue-600" : "bg-slate-900"
          } h-[5px] rounded-full`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </>
  );
};
