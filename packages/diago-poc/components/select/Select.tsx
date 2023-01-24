import { SyntheticEvent } from "react";

export type option = {
  label: string;
  value: string;
};

interface SelectProps {
  /**
   * Custom class
   */
  className?: string;
  /**
   * Label name
   */
  label?: string;
  /**
   * Select name
   */
  name: string;
  /**
   * Select options
   */
  options?: option[];
  /**
   * Selected value
   */
  defaultValue?: string;
  /**
   * Placeholder
   **/
  placeholder?: string;
  /**
   * Event handler
   */
  onChangeHandler?: (event: SyntheticEvent) => void;
}

export const Select = ({
  className = "",
  label = "",
  name,
  options = [],
  defaultValue,
  placeholder = "Sélectionnez une option",
  onChangeHandler,
}: SelectProps) => {
  return (
    <div className={`w-full ${className}`}>
      {label !== "" && (
        <label className="block mb-2" htmlFor={name}>
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        defaultValue={defaultValue || "unknown"}
        className="px-6 flex items-center w-full h-16 border-0 bg-gray-100 border-b-[3px] border-gray-600 focus:ring-0 focus:border-blue-600 text-lg focus:outline-none"
        onChange={onChangeHandler}
      >
        <option key="0" value="unknown" disabled hidden>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.label} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
