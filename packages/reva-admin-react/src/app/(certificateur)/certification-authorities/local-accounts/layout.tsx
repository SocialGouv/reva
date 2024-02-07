"use client";

import { ReactNode } from "react";

import { withRolesGuard } from "@/components/guards/withRolesGuard.component";

const Layout = ({ children }: { children: ReactNode }) => {
  return <div className="w-full">{children}</div>;
};

export default withRolesGuard(["manage_certification_authority_local_account"])(
  Layout,
);
