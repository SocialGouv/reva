"use client";
import SideMenu from "@codegouvfr/react-dsfr/SideMenu";
import { usePathname, useSearchParams } from "next/navigation";
import { ReactNode } from "react";

export default function CertificationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const currentPathname = usePathname();
  const searchParams = useSearchParams();

  const searchFilter = searchParams.get("search") || "";

  const hrefSideMenu = (path: string, category: string) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("CATEGORY", category);

    if (searchFilter) {
      params.set("search", searchFilter);
    }

    return `${path}/?${params.toString()}`;
  };

  const menuItem = ({
    text,
    path,
    category,
    defaultMenuItem,
  }: {
    text: string;
    path: string;
    category: string;
    defaultMenuItem?: boolean;
  }) => ({
    isActive:
      (currentPathname.startsWith(path) &&
        searchParams.get("CATEGORY") === category) ||
      (!searchParams.get("CATEGORY") && defaultMenuItem),
    linkProps: {
      href: hrefSideMenu(path, category),
      target: "_self",
    },
    text,
  });

  const validatedManuItems = [
    menuItem({
      text: "Visibles",
      path: "/responsable-certifications/certifications/",
      category: "VISIBLE",
    }),
    menuItem({
      text: "Invisibles",
      path: "/responsable-certifications/certifications/",
      category: "INVISIBLE",
    }),
  ];

  const toValidateMenuItems = [
    menuItem({
      text: "À valider",
      path: "/responsable-certifications/certifications/",
      category: "TO_VALIDATE",
      defaultMenuItem: true,
    }),
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
              expandedByDefault: true,
            },
            ...toValidateMenuItems,
          ]}
        />
      </nav>

      <div className="mt-3 flex-1">{children}</div>
    </div>
  );
}
