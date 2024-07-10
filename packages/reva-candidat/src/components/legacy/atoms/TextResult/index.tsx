type Color = "dark" | "light";
type Size = "small" | "large";

interface TextResultProps {
  color?: Color;
  onClick?: () => void;
  key?: string;
  size?: Size;
  title: string;
}

export const TextResult = ({
  color = "dark",
  size = "small",
  title,
  onClick,
  ...props
}: TextResultProps) => {
  const colorClass =
    color === "dark" ? "font-bold text-slate-900" : "font-medium text-white";

  const sizeClass = size === "small" ? "text-2xl" : "text-3xl tracking-tight";

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded ${colorClass} ${sizeClass}`}
      style={{ lineHeight: "1.1" }}
      {...props}
    >
      {title}
    </div>
  );
};
