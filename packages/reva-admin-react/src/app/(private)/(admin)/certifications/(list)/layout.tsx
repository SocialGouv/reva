"use client";
import { Button } from "@codegouvfr/react-dsfr/Button";
import SideMenu, { SideMenuProps } from "@codegouvfr/react-dsfr/SideMenu";
import { useSearchParams } from "next/navigation";
import { ReactNode } from "react";

const CertificationListLayout = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") || undefined;
  const searchFilter = searchParams.get("search") || "";
  const visibleParam = searchParams.get("visible") || undefined;

  const hrefSideMenu = (status?: string, visible?: "true" | "false") => {
    const params = new URLSearchParams();
    if (status) {
      params.set("status", status);
    }

    if (visible) {
      params.set("visible", visible);
    }

    params.set("page", "1");

    if (searchFilter) {
      params.set("search", searchFilter);
    }

    return `/certifications/?${params.toString()}`;
  };

  const menuItem = (
    text: string,
    status?: string,
    visible?: "true" | "false",
  ): SideMenuProps.Item => ({
    isActive: status === statusParam && visible === visibleParam,
    linkProps: {
      href: hrefSideMenu(status, visible),
      target: "_self",
    },
    text,
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
