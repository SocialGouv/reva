import { Loader, Locked } from "../Icons";

interface ButtonProps {
  /**
   * Custom class
   */
  className?: string;

  /**
   * Button contents
   */
  label: string;
  /**
   * Is disabled with a locked style
   */
  locked?: boolean;
  /**
   * Is disabled with a loading style
   */
  loading?: boolean;
  /**
   * Optional click handler
   */
  onClick?: () => void;
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;
  /**
   * What background class to use
   */
  backgroundClass?: string;

  disabled?: boolean;
  /**
   * How large should the button be?
   */
  size?: "tiny" | "small" | "medium" | "large";
  tabIndex?: number;
  type?: "button" | "submit";
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({
  className = "",
  disabled = false,
  label,
  locked = false,
  loading = false,
  primary = false,
  size = "medium",
  tabIndex = 0,
  type = "button",

  ...props
}: ButtonProps) => {
  const modeClass = primary
    ? "font-medium bg-blue-600 text-white"
    : locked == true || loading == true
    ? "font-normal bg-white text-gray-600 border border-[#A1A0BA]"
    : className != ""
    ? className
    : "font-medium bg-slate-900 text-white";

  let sizeClasses = {
    tiny: "text-sm pb-1 px-4 h-[25px]",
    small: "text-sm px-8 h-[35px]",
    medium: "text-base w-[190px] h-[45px]",
    large: "text-lg h-[53px] w-full",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } rounded-md flex justify-center items-center ${modeClass} ${
        sizeClasses[size]
      }`}
      tabIndex={tabIndex}
      {...props}
    >
      {locked && (
        <span className="text-gray-400 w-[20px] h-[20px] -ml-[28px] mr-[8px]">
          <Locked />
        </span>
      )}
      {loading && (
        <span className="text-gray-400 w-[20px] h-[20px] -ml-[28px] mr-[8px]">
          <Loader />
        </span>
      )}
      {label}
    </button>
  );
};
