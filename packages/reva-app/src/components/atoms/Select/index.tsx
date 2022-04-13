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
   * Input name
   */
  name: string;
  /**
   * Input placeholder
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
      <div className="relative">
        <select
          id={name}
          name={name}
          className="px-6 rounded-t flex items-center w-full h-16 border-0 bg-gray-100 border-b-[3px] border-gray-600 focus:ring-0 focus:border-blue-600 text-lg"
          {...props}
        >
          <option value="" selected disabled hidden>
            Selectionnez une option
          </option>
          {options.map((opt) => (
            <option value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
