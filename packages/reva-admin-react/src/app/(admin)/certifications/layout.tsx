"use client";
import SideMenu from "@codegouvfr/react-dsfr/SideMenu";
import { useSearchParams } from "next/navigation";
import { ReactNode } from "react";

const CertificationListLayout = ({ children }: { children: ReactNode }) => {
  const params = useSearchParams();
  const statusParam = params.get("status");

  const menuItem = (text: string, status: string | null) => ({
    isActive: status === statusParam,
    linkProps: {
      href: `/certifications${status ? `?status=${status}` : ""}`,
      target: "_self",
    },
    text,
  });
  return (
    <div className="w-full flex gap-6">
      <SideMenu
        className="flex-shrink-0 flex-grow-0 md:basis-[330px]"
        align="left"
        burgerMenuButtonText="Certifications"
        sticky
        fullHeight
        items={[
          menuItem("Toutes les certifications", null),
          menuItem("Certifications disponibles", "AVAILABLE"),
          menuItem("Certifications inactives", "INACTIVE"),
        ]}
      />
      {children}
    </div>
  );
};

export default CertificationListLayout;
