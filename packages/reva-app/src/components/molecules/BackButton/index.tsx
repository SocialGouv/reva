import { Back } from "../../atoms/Icons";

type Color = "dark" | "light";

interface BackButton {
  color?: Color;
  onClick: () => void;
}

export const BackButton = ({ color = "dark", onClick }: BackButton) => {
  const colorClass = color === "dark" ? "text-slate-900" : "text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-end w-full pt-6 px-8 h-24 ${colorClass}`}
    >
      <div className="w-[22px]">
        <Back />
      </div>
    </button>
  );
};
