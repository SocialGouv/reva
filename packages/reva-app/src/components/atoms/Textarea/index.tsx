import { SearchIcon } from "../Icons";

interface TextareaProps {
  /**
   * Custom class
   */
  className?: string;
  defaultValue?: string;
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
  placeholder?: string;
  /**
   * Rows
   */
  rows?: number;
}

export const Textarea = ({
  className = "",
  defaultValue = "",
  label = "",
  name,
  placeholder = "",
  rows = 3,
  ...props
}: TextareaProps) => {
  return (
    <div className={`relative w-full ${className}`}>
      {label !== "" && (
        <label className="block mb-2" htmlFor={name}>
          {label}
        </label>
      )}
      <textarea
        id={name}
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        rows={rows}
        className="rounded-t flex items-center w-full px-6 py-4 border-0 bg-gray-100 border-b-[3px] border-gray-600 focus:ring-0 focus:border-blue-600 text-lg placeholder:text-gray-500"
        {...props}
      />
    </div>
  );
};
