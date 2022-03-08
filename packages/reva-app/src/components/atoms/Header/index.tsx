type Color = "dark" | "light";

interface HeaderProps {
  color?: Color;
  label: string;
}

const colorClass = (color: Color) =>
  color === "dark" ? "text-slate-900" : "text-white";

export const Header = ({ color = "dark", label = "" }: HeaderProps) => (
  <h1 className={`${colorClass(color)} font-bold text-4xl`}>{label}</h1>
);
