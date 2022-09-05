import { Back } from "../../atoms/Icons";

type Color = "dark" | "light";

interface BackButtonProps {
  color?: Color;
  className?: string;
  onClick: () => void;
}

export const BackButton = ({
  className = "",
  color = "dark",
  onClick,
}: BackButtonProps) => {
  const colorClass = color === "dark" ? "text-slate-900" : "text-white";

  return (
    <button
      data-test="button-back"
      type="button"
      onClick={onClick}
      className={`${className} shrink-0 flex items-center justify-end w-full pt-6 px-8 h-18 mt-6 ${colorClass}`}
    >
      <div className="w-[22px]">
        <Back />
        <span className="sr-only">Revenir</span>
      </div>
    </button>
  );
};
