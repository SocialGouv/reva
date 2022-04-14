import { SearchIcon } from "../Icons";

interface InputProps {
  /**
   * What type of input is it?
   */
  type?: "search" | "text" | "date";
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
   * Min and maximum value length
   */
  minLength?: number;
  maxLength?: number;
  /**
   * Input name
   */
  name: string;
  /**
   * Input placeholder
   */
  placeholder?: string;
  /**
   * Is this field required?
   */
  required?: boolean;
}

export const Input = ({
  type = "text",
  className = "",
  defaultValue = "",
  label = "",
  maxLength = 256,
  minLength = 3,
  name,
  placeholder = "",
  required = false,
  ...props
}: InputProps) => {
  return (
    <div className={`w-full ${className}`}>
      {label !== "" && (
        <label className="block mb-2" htmlFor={name}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          defaultValue={defaultValue}
          name={name}
          maxLength={maxLength}
          minLength={minLength}
          placeholder={placeholder}
          required={required}
          type={type}
          className={`${type === "search" ? "pl-6 pr-16" : "px-6"} ${
            type !== "date" ? "w-full" : "w-[190px]"
          } flex items-center h-16 border-0 bg-gray-100 border-b-[3px] border-gray-600 focus:ring-0 focus:border-blue-600 text-lg placeholder:text-gray-500`}
          {...props}
        />
        {type === "search" ? (
          <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5" aria-hidden="true" />
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};
