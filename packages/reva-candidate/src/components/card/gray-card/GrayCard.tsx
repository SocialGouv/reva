import { ReactNode } from "react";

export const GrayCard = ({
  children,
  className,
  "data-test": dataTest,
  as = "li",
}: {
  children: ReactNode;
  className?: string;
  "data-test"?: string;
  as?: React.ElementType;
}) => {
  const Component = as;
  return (
    <Component
      data-test={dataTest}
      className={`bg-neutral-100 p-4 sm:p-6 flex flex-col ${className || ""}`}
    >
      {children}
    </Component>
  );
};
