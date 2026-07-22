"use client";
import { Button } from "@codegouvfr/react-dsfr/Button";
import SideMenu, { SideMenuProps } from "@codegouvfr/react-dsfr/SideMenu";
import { useSearchParams } from "next/navigation";
import { ReactNode } from "react";

import { createCertificationListSideMenu } from "@/components/certification-list-layout/certificationListSideMenu";

const CertificationListLayout = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") || undefined;
  const searchFilter = searchParams.get("search") || "";
  const visibleParam = searchParams.get("visible") || undefined;

  const { menuItem } = createCertificationListSideMenu({
    basePath: "/certifications/",
    searchFilter,
    statusParam,
    visibleParam,
  });

  const items: SideMenuProps.Item[] = [
    menuItem("Toutes les certifications"),
    {
      ...menuItem("Publiées", "VALIDE_PAR_CERTIFICATEUR"),
      items: [
        menuItem("Visibles", "VALIDE_PAR_CERTIFICATEUR", "true"),
        menuItem("Invisibles", "VALIDE_PAR_CERTIFICATEUR", "false"),
      ],
    },
    menuItem("Envoyées pour validation", "A_VALIDER_PAR_CERTIFICATEUR"),
    menuItem("Brouillons", "BROUILLON"),
  ];

  return (
    <div className="w-full flex flex-col md:flex-row gap-6">
      <SideMenu
        className="flex-shrink-0 flex-grow-0 md:basis-[330px] md:w-[330px]"
        align="left"
        burgerMenuButtonText="Certifications"
        sticky
        fullHeight
        items={[
          ...items,
          {
            isActive: false,
            linkProps: {
              href: "/certifications/add-certification",
              target: "_self",
            },
            text: (
              <div className="w-full h-full flex justify-center bg-transparent">
                <Button
                  data-testid="add-certification-button"
                  size="small"
                  priority="secondary"
                >
                  Ajouter une certification
                </Button>
              </div>
            ),
          },
        ]}
      />

      <div className="mt-3 w-full">{children}</div>
    </div>
  );
};

export default CertificationListLayout;
