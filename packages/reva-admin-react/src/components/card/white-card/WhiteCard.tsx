import { ReactNode } from "react";

export const WhiteCard = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <li className={`bg-white p-6 border flex flex-col ${className || ""}`}>
    {children}
  </li>
);
