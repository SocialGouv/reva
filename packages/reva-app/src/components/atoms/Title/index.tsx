type Size = "small" | "large";
type Level = 1 | 2;
type Theme = "dark" | "light";

interface TitleProps {
  label: string;
  level?: Level;
  size?: Size;
  theme?: Theme;
}

export const Title = ({
  label = "",
  level = 1,
  size = "small",
  theme = "light",
  ...props
}: TitleProps) => {
  const className = `mt-4 font-bold ${
    size === "small" ? "text-xl" : "text-2xl"
  } ${theme === "dark" ? "text-white" : "text-slate-800"}`;
  return level === 1 ? (
    <h1 className={className} {...props}>
      {label}
    </h1>
  ) : (
    <h2 className={className} {...props}>
      {label}
    </h2>
  );
};
