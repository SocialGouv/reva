import { Title } from "../../atoms/Title";

type Size = "small" | "large";
type Theme = "dark" | "light";

interface Props {
  progress: number;
  size?: Size;
  theme?: Theme;
  title: string;
}

export const ProgressTitle = ({
  progress,
  size = "small",
  theme = "light",
  title,
}: Props) => {
  return (
    <>
      <div className="flex items-end justify-between">
        <Title label={title} size={size} theme={theme} />
        <div
          data-test="progress-title-value"
          className={`font-semibold text-base ${
            theme === "dark" ? "text-white" : "text-gray-500"
          }`}
        >
          {progress}%
        </div>
      </div>
      <div
        className={`mt-2 w-full rounded-full h-[5px] ${
          theme === "dark" ? "bg-gray-900" : "bg-slate-300"
        }`}
      >
        <div
          className={`${
            size === "small" ? "bg-blue-600" : "bg-slate-900"
          } h-[5px] rounded-full`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </>
  );
};
