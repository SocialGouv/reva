import React from "react";
import "../index.css";

interface ButtonProps {
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
  primary = false,
  size = "medium",
  backgroundColor,
  label,
  ...props
}: ButtonProps) => {
  const modeClass = primary ? "bg-blue-500 text-white" : "shadow text-gray-900";
  let sizeClasses = {
    small: "text-sm px-2 py-1",
    medium: "text-base px-3 py-1",
    large: "text-lg px-4 py-2",
  };

  return (
    <button
      type="button"
      className={`rounded ${modeClass} ${sizeClasses[size]}`}
      style={{ backgroundColor }}
      {...props}
    >
      {label}
    </button>
  );
};
