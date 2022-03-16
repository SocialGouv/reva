type Color = "dark" | "light";
type Size = "small" | "large";

interface HeaderProps {
  color?: Color;
  label: string;
  size?: Size;
}

const colorClass = (color: Color) =>
  color === "dark" ? "text-slate-900" : "text-white";

const fontClass = (size: Size) =>
  size == "small" ? "font-medium" : "font-bold";

export const Header = ({
  color = "dark",
  size = "large",
  label = "",
}: HeaderProps) => (
  <h1 className={`${colorClass(color)} ${fontClass(size)} my-4 text-4xl`}>
    {label}
  </h1>
);
