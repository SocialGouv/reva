"use client";

import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return <div className="w-full">{children}</div>;
};

export default Layout;
