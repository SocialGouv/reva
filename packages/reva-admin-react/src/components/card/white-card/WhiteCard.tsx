import { MouseEventHandler, ReactNode } from "react";

export const WhiteCard = ({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLLIElement>;
}) => (
  <li
    className={`bg-white p-6 border flex flex-col ${className || ""}`}
    onClick={onClick}
  >
    {children}
  </li>
);
