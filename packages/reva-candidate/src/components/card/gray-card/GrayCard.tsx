import { ReactNode } from "react";

export const GrayCard = ({
  children,
  className,
  "data-test": dataTest,
}: {
  children: ReactNode;
  className?: string;
  "data-test"?: string;
}) => (
  <li
    data-test={dataTest}
    className={`bg-neutral-100 p-4 sm:p-6 flex flex-col ${className || ""}`}
  >
    {children}
  </li>
);
