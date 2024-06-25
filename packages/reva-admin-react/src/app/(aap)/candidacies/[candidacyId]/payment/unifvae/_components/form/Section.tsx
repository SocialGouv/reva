import { ReactNode } from "react";

export const Section = ({
  title,
  children,
  className,
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) => (
  <section className={`flex flex-col pb-6 ${className || ""}`}>
    <h2 className="text-xl mb-4">{title}</h2>
    {children}
  </section>
);
