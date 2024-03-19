import { ReactNode } from "react";

export const PageTitle = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <h1 className={`${className || ""}`}>{children}</h1>;
