import { ReactNode } from "react";

export const PageTitle = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <h1 className={`font-bold text-4xl mb-8 ${className || ""}`}>{children}</h1>
);
