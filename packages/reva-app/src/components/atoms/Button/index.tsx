import { AnimatePresence, motion, useMotionValue } from "framer-motion";

interface ButtonProps {
  /**
   * Custom class
   */
  className?: string;
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;
  /**
   * What background color to use
   */
  backgroundColor?: string;
  /**
   * How large should the button be?
   */
  size?: "tiny" | "small" | "medium" | "large";
  /**
   * Button contents
   */
  label: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({
  className = "",
  primary = false,
  size = "medium",
  backgroundColor,
  label,
  ...props
}: ButtonProps) => {
  const modeClass = primary
    ? "bg-blue-600 text-white"
    : "bg-slate-900 text-white";

  let sizeClasses = {
    tiny: "text-sm px-2 py-1",
    small: "text-sm px-5 h-[35px]",
    medium: "text-base w-[190px] h-[45px]",
    large: "text-lg h-[53px]",
  };

  return (
    <button
      type="button"
      className={`rounded flex justify-center items-center ${modeClass} ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor }}
      {...props}
    >
      {label}
    </button>
  );
};
