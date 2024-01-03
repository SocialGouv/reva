import { ReactNode } from "react";

export const GrayCard = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <li
    className={`bg-neutral-100 hover:bg-gray-50 p-6 flex flex-col ${
      className || ""
    }`}
  >
    {children}
  </li>
);
