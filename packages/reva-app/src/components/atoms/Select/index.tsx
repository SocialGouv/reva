import { SearchIcon } from "../Icons";

type option = {
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
}

export const Select = ({
  className = "",
  label = "",
  name,
  options = [],
  ...props
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
        defaultValue="unknown"
        className="px-6 flex items-center w-full h-16 border-0 bg-gray-100 border-b-[3px] border-gray-600 focus:ring-0 focus:border-blue-600 text-lg"
        {...props}
      >
        <option key="0" value="unknown" disabled hidden>
          Sélectionnez une option
        </option>
        {options.map((opt, index) => (
          <option key={index + 1} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
