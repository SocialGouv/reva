import { ReactNode } from "react";

export const Info = ({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) => (
  <div className="flex flex-col">
    <dt className="text-xs font-bold uppercase mb-2">{title}</dt>
    <dd>{children}</dd>
  </div>
);
