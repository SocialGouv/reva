import { ReactNode } from "react";

export const GrayCard = ({
  children,
  className,
  "data-testid": dataTest,
  as = "li",
}: {
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
  as?: React.ElementType;
}) => {
  const Component = as;
  return (
    <Component
      data-testid={dataTest}
      className={`bg-neutral-100 p-4 sm:p-6 flex flex-col ${className || ""}`}
    >
      {children}
    </Component>
  );
};
