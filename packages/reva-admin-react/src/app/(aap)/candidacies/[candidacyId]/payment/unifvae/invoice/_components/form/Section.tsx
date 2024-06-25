import { ReactNode } from "react";

export const Section = ({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) => (
  <section className="flex flex-col pb-6">
    <h2 className="text-xl mb-4">{title}</h2>
    {children}
  </section>
);
