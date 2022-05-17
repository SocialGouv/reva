type Color = "dark" | "light";
type Size = "small" | "large";
type Level = 1 | 2;

interface HeaderProps {
  color?: Color;
  label: string;
  level?: Level;
  size?: Size;
}

const colorClass = (color: Color) =>
  color === "dark" ? "text-slate-900" : "text-white";

const fontClass = (size: Size) =>
  size == "small" ? "font-medium" : "font-bold";

export const Header = ({
  color = "dark",
  size = "large",
  level = 1,
  label = "",
}: HeaderProps) => {
  const className = `${colorClass(color)} ${fontClass(size)} my-4 text-4xl`;
  return level === 1 ? (
    <h1 className={className}>{label}</h1>
  ) : (
    <h2 className={className}>{label}</h2>
  );
};
