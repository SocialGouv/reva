import { ReactNode } from "react";

export default function RegistryManagerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="flex flex-col md:flex-row w-full">{children}</div>;
}
