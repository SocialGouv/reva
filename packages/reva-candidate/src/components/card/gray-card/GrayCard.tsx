import { ReactNode } from "react";

export const GrayCard = ({
  children,
  className,
  "data-testid": dataTest,
}: {
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
}) => (
  <li
    data-testid={dataTest}
    className={`bg-neutral-100 p-4 sm:p-6 flex flex-col ${className || ""}`}
  >
    {children}
  </li>
);
