import { ReactNode } from "react";

export const TableRow = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => (
  <div
    className={`flex gap-6 *:basis-1/3 px-6 py-6 [&:not(:last-child)]:border-b last:pb-2 ${className || ""}`}
  >
    {children}
  </div>
);
