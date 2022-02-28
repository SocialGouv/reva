import { SearchIcon } from "../Icons";

interface InputProps {
  /**
   * What type of input is it?
   */
  type?: "search" | "text";
  /**
   * Input name
   */
  name: string;
  /**
   * Input placeholder
   */
  placeholder: string;
  /**
   * Custom class
   */
  className?: string;
}

export const Input = ({
  type = "text",
  className = "",
  ...props
}: InputProps) => {
  return (
    <div className={`relative w-full flex items-center ${className}`}>
      <input
        type={type}
        className={`${
          type === "search" ? "pl-6 pr-16" : "px-6"
        } block w-full h-20 border-0 bg-gray-100 border-b-[3px] border-gray-900 focus:ring-0 focus:border-blue-600 text-lg placeholder:text-gray-500
           `}
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
  );
};
