"use client";
import { ReactNode, useCallback, useMemo } from "react";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { usePathname, useSearchParams } from "next/navigation";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

const menuItem = (text: string, path: string, currentPathname: string) => ({
  isActive: path.startsWith(currentPathname),
  linkProps: {
    href: path,
    target: "_self",
  },
  text,
});

const SubscriptionsLayout = ({ children }: { children: ReactNode }) => {
  const currentPathname = usePathname();

  const searchParams = useSearchParams();
  const searchFilter = searchParams.get("search") || "";

  const hrefSideMenu = useCallback(
    (subPath: string) => {
      const params = new URLSearchParams();
      params.set("page", "1");

      if (searchFilter) {
        params.set("search", searchFilter);
      }

      return `/subscriptions/${subPath}/?${params.toString()}`;
    },
    [searchFilter],
  );

  const featureFlipping = useFeatureflipping();
  const showLegalMenuItems = featureFlipping.isFeatureActive(
    "LEGAL_INFORMATION_VALIDATION",
  );

  const items = useMemo(() => {
    if (showLegalMenuItems) {
      return [
        menuItem(
          "En attente (sous l'ancienne méthode)",
          hrefSideMenu("pending"),
          currentPathname,
        ),
        menuItem(
          "Refusées (sous l'ancienne méthode)",
          hrefSideMenu("rejected"),
          currentPathname,
        ),
        menuItem(
          "Validées (sous l'ancienne méthode)",
          hrefSideMenu("validated"),
          currentPathname,
        ),
        menuItem("En attente", hrefSideMenu("pending-v2"), currentPathname),
        menuItem("Refusées", hrefSideMenu("rejected-v2"), currentPathname),
        menuItem(
          "Pièces jointes à vérifier",
          hrefSideMenu("check-legal-information"),
          currentPathname,
        ),
        menuItem(
          "Validées et mises à jour",
          hrefSideMenu("up-to-date"),
          currentPathname,
        ),
      ];
    }
    return [
      menuItem("En attente", hrefSideMenu("pending"), currentPathname),
      menuItem("Validées", hrefSideMenu("validated"), currentPathname),
      menuItem("Refusées", hrefSideMenu("rejected"), currentPathname),
    ];
  }, [showLegalMenuItems, currentPathname, hrefSideMenu]);

  return (
    <div className="flex flex-col flex-1 md:flex-row gap-10 md:gap-0">
      <SideMenu
        className="flex-shrink-0 flex-grow-0 md:basis-[330px]"
        align="left"
        burgerMenuButtonText="Inscriptions"
        sticky
        fullHeight
        title="Inscriptions"
        items={items}
      />
      <div className="mt-3">{children}</div>
    </div>
  );
};

export default SubscriptionsLayout;
