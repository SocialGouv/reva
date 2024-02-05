"use client";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { useParams, usePathname } from "next/navigation";
import { ReactNode } from "react";

const CandidacyPageLaout = ({ children }: { children: ReactNode }) => {
  const currentPathname = usePathname();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { isFeatureActive } = useFeatureflipping();

  const menuItem = (text: string, path: string) => ({
    isActive: currentPathname.startsWith(path),
    linkProps: {
      href: path,
      target: "_self",
    },
    text,
  });

  return isFeatureActive("DOSSIER_DE_VALIDATION") ? (
    <div className="flex flex-col flex-1 md:flex-row gap-10 md:gap-0">
      <SideMenu
        className="flex-shrink-0 flex-grow-0 md:basis-[300px]"
        align="left"
        burgerMenuButtonText="Candidatures"
        sticky
        fullHeight
        items={[
          menuItem(
            "Étude de faisabilité",
            `/candidacies/${candidacyId}/feasibility`,
          ),
          menuItem(
            "Dossier de validation",
            `/candidacies/${candidacyId}/dossier-de-validation`,
          ),
        ]}
      />
      <div className="mt-3 flex-1">{children}</div>
    </div>
  ) : (
    children
  );
};

export default CandidacyPageLaout;
