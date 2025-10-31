"use client";
import { Button } from "@codegouvfr/react-dsfr/Button";
import SideMenu, { SideMenuProps } from "@codegouvfr/react-dsfr/SideMenu";
import { useSearchParams } from "next/navigation";
import { ReactNode } from "react";

import { CertificationStatus } from "@/graphql/generated/graphql";

export default function CertificationsLayout({
  children,
}: {
  children: ReactNode;
}) {
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

    return `/responsable-certifications/certifications/?${params.toString()}`;
  };

  const menuItem = (
    text: string,
    status?: CertificationStatus,
    visible?: "true" | "false",
  ): SideMenuProps.Item => ({
    isActive: status === statusParam && visible === visibleParam,
    linkProps: {
      href: hrefSideMenu(status, visible),
      target: "_self",
    },
    text,
  });

  const validatedManuItems = [
    menuItem("Visibles", "VALIDE_PAR_CERTIFICATEUR", "true"),
    menuItem("Invisibles", "VALIDE_PAR_CERTIFICATEUR", "false"),
  ];

  const toValidateMenuItems = [
    menuItem("À valider", "A_VALIDER_PAR_CERTIFICATEUR"),
  ];

  return (
    <div className="flex flex-col flex-1 md:flex-row gap-10 md:gap-0">
      <nav
        role="navigation"
        aria-label="Menu latéral"
        className="flex flex-col gap-4 md:basis-[300px]"
      >
        <SideMenu
          className="flex-shrink-0 flex-grow-0 md:basis-[300px]"
          align="left"
          burgerMenuButtonText="Toutes les certifications"
          sticky
          fullHeight
          title="Toutes les certifications"
          items={[
            {
              text: "Validées",
              items: validatedManuItems,
            },
            ...toValidateMenuItems,
            {
              isActive: false,
              linkProps: {
                href: "https://tally.so/r/w4PdvY",
                target: "_blank",
              },
              text: (
                <Button
                  data-testid="add-certification-button"
                  size="small"
                  priority="secondary"
                >
                  Ajouter une certification
                </Button>
              ),
            },
          ]}
        />
      </nav>

      <div className="mt-3 flex-1">{children}</div>
    </div>
  );
}
