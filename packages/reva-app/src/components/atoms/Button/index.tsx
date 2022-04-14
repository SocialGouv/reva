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
  type?: "button" | "submit";
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({
  className = "",
  disabled = false,
  label,
  primary = false,
  size = "medium",
  type = "button",

  ...props
}: ButtonProps) => {
  const modeClass = primary
    ? "bg-blue-600 text-white"
    : className != ""
    ? className
    : "bg-slate-900 text-white";

  let sizeClasses = {
    tiny: "text-sm pb-1 px-4 h-[25px]",
    small: "text-sm px-8 h-[35px]",
    medium: "text-base w-[190px] h-[45px]",
    large: "text-lg h-[53px] w-full",
  };

  return (
    <button
      type={type}
      className={`${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } rounded font-medium flex justify-center items-center ${modeClass} ${
        sizeClasses[size]
      }`}
      {...props}
    >
      {label}
    </button>
  );
};
