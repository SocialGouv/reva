type Color = "dark" | "light";

interface TextResult {
  color?: Color;
  title: string;
}

export const TextResult = ({ color = "dark", title }: TextResult) => {
  const colorClass =
    color === "dark" ? "font-bold text-slate-900" : "font-medium text-white";
  return <div className={`my-4 text-2xl ${colorClass}`}>{title}</div>;
};
