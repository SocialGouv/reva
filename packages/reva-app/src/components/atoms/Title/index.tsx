type Size = "small" | "large";

interface TitleProps {
  label: string;
  size?: Size;
}

export const Title = ({ label = "", size = "small" }: TitleProps) => (
  <h3
    className={`mt-4 text-slate-800 font-bold ${
      size == "small" ? "text-xl" : "text-2xl"
    }`}
  >
    {label}
  </h3>
);
