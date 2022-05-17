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
  toggle: () => void;
}

export const Checkbox = ({
  checked,
  name,
  label,
  toggle,
  className = "",
  ...props
}: CheckboxProps) => {
  const labelName = `label-${name}`;
  return (
    <div className="relative flex items-start">
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
      <div className="ml-3 text-lg">
        <label
          id={labelName}
          htmlFor={name}
          className="block text-slate-700 leading-snug"
        >
          {label}
        </label>
      </div>
    </div>
  );
};
