"use client";
import { ReactNode, useMemo } from "react";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { usePathname } from "next/navigation";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

const menuItem = (text: string, path: string, currentPathname: string) => ({
  isActive: currentPathname.startsWith(path),
  linkProps: {
    href: path,
    target: "_self",
  },
  text,
});

const SubscriptionsLayout = ({ children }: { children: ReactNode }) => {
  const currentPathname = usePathname();


  const featureFlipping = useFeatureflipping();
  const showLegalMenuItems = featureFlipping.isFeatureActive("LEGAL_INFORMATION_VALIDATION")

  const items = useMemo(() => {
    if (showLegalMenuItems) {
      return [
        menuItem("En attente", "/subscriptions/pending", currentPathname),
        menuItem("Validées (sous l'ancienne méthode)", "/subscriptions/validated", currentPathname),
        menuItem("Refusées", "/subscriptions/rejected", currentPathname),
        menuItem("Pièces jointes à vérifier", "/subscriptions/check-legal-information", currentPathname),
        menuItem("Validées et mises à jour", "/subscriptions/up-to-date", currentPathname)
        ]
    }
    return [
      menuItem("En attente", "/subscriptions/pending", currentPathname),
      menuItem("Validées", "/subscriptions/validated", currentPathname),
      menuItem("Refusées", "/subscriptions/rejected", currentPathname),
    ];
  }, [showLegalMenuItems, currentPathname]);

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
