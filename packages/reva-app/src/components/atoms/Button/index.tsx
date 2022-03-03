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
  size?: "small" | "medium" | "large";
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
  const modeClass = primary ? "bg-blue-600 text-white" : "shadow text-gray-900";
  let sizeClasses = {
    small: "text-sm px-2 py-1",
    medium: "text-base py-4 w-full",
    large: "text-lg py-5 w-full",
  };

  return (
    <button
      type="button"
      className={`rounded ${modeClass} ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor }}
      {...props}
    >
      {label}
    </button>
  );
};
