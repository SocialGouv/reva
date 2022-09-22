import classNames from "classnames";

type Size = "small" | "large";
type Theme = "dark" | "light";
interface CheckboxProps {
  checked: boolean;
  /**
   * Checkbox name
   */
  name: string;
  /**
   * Checkbox label
   */
  label: string;
  /**
   * Custom class
   */
  className?: string;
  size?: Size;
  theme?: Theme;
  toggle: () => void;
}

export const Checkbox = ({
  checked,
  name,
  label,
  size = "large",
  toggle,
  theme = "light",
  className = "",
  ...props
}: CheckboxProps) => {
  const labelName = `label-${name}`;
  return (
    <div className={`relative flex items-start ${className}`}>
      <div className="flex items-center h-[26px]">
        <input
          id={name}
          name={name}
          aria-labelledby={labelName}
          defaultChecked={checked}
          onClick={toggle}
          type="checkbox"
          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
        />
      </div>
      <div
        className={classNames("ml-3", size === "large" ? "text-lg" : "text-md")}
      >
        <label
          id={labelName}
          htmlFor={name}
          className={classNames(
            "block",
            "leading-snug",
            theme === "light" ? "text-slate-700" : "text-slate-400"
          )}
        >
          {label}
        </label>
      </div>
    </div>
  );
};
