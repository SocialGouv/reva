import { ReactNode } from "react";

export const PageTitle = ({ children }: { children: ReactNode }) => (
  <h1 className="font-bold text-4xl mb-8">{children}</h1>
);
