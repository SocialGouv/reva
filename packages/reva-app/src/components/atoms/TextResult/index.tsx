type Color = "dark" | "light";

interface TextResult {
  color?: Color;
  key?: string;
  title: string;
}

export const TextResult = ({ color = "dark", title, ...props }: TextResult) => {
  const colorClass =
    color === "dark" ? "font-bold text-slate-900" : "font-medium text-white";
  return (
    <div className={`text-2xl ${colorClass}`} {...props}>
      {title}
    </div>
  );
};
