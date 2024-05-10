import { ReactNode } from "react";

export const Info = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <dl className={`m-2 ${className || ""}`}>
    <dt className="font-bold mb-1">{title}</dt>
    <dd>{children}</dd>
  </dl>
);
