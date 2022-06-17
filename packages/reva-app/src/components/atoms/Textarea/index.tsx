import React, { ForwardedRef } from "react";

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
   * onFocus callback
   */
  onFocus: () => void;
  /**
   * Input placeholder
   */
  placeholder?: string;
  /**
   * Rows
   */
  rows?: number;
}

export const Textarea = React.forwardRef(
  (
    {
      className = "",
      defaultValue = "",
      label = "",
      name,
      onFocus,
      placeholder = "",
      rows = 3,
      ...props
    }: TextareaProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    return (
      <div ref={ref} className={`relative w-full ${className}`} {...props}>
        {label !== "" && (
          <label className="block mb-2" htmlFor={name}>
            {label}
          </label>
        )}
        <textarea
          id={name}
          defaultValue={defaultValue}
          name={name}
          onFocus={onFocus}
          placeholder={placeholder}
          rows={rows}
          className="rounded-t flex items-center w-full px-6 py-4 border-0 bg-gray-100 border-b-[3px] border-gray-600 focus:ring-0 focus:border-blue-600 text-lg placeholder:text-gray-500"
        />
      </div>
    );
  }
);
