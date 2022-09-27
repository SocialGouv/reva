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
  disabled?: boolean;
  theme?: Theme;
  toggle: () => void;
}

export const Checkbox = ({
  checked,
  name,
  label,
  size = "large",
  disabled = false,
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
          data-test={`checkbox-${name}`}
          aria-labelledby={labelName}
          disabled={disabled}
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
          data-test={`label-${name}`}
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
