import { ReactNode } from "react";

export const WhiteCard = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <li
    className={`bg-white py-5 pl-6 pr-4 border flex flex-col ${
      className || ""
    }`}
  >
    {children}
  </li>
);
