type Size = "small" | "large";
type Level = 1 | 2;

interface TitleProps {
  label: string;
  level?: Level;
  size?: Size;
}

export const Title = ({
  label = "",
  level = 1,
  size = "small",
  ...props
}: TitleProps) => {
  const className = `mt-4 text-slate-800 font-bold ${
    size == "small" ? "text-xl" : "text-2xl"
  }`;
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
