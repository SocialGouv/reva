"use client";

import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full flex gap-6">
      <div className="w-[265px] border-r-gray-200 border-r-[1px] hidden md:block" />
      {children}
    </div>
  );
};

export default Layout;
