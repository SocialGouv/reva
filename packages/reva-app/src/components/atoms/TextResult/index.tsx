type Color = "dark" | "light";

interface TextResult {
  color?: Color;
  onClick?: () => void;
  key?: string;
  title: string;
}

export const TextResult = ({
  color = "dark",
  title,
  onClick,
  ...props
}: TextResult) => {
  const colorClass =
    color === "dark" ? "font-bold text-slate-900" : "font-medium text-white";
  const fontSizeClass = title.length > 65 ? "text-xl" : "text-2xl";
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer ${fontSizeClass} ${colorClass}`}
      {...props}
    >
      {title}
    </div>
  );
};
