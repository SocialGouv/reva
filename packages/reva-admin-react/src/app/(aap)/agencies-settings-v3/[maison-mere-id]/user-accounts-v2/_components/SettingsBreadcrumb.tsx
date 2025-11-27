import Breadcrumb, { BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";

import { useAuth } from "@/components/auth/auth";

export const SettingsBreadcrumb = ({
  currentPageLabel,
  maisonMereAAPId,
  segmentsAfterBaseSegments = [],
}: {
  currentPageLabel: string;
  maisonMereAAPId: string;
  segmentsAfterBaseSegments?: BreadcrumbProps["segments"];
}) => {
  const { isAdmin } = useAuth();

  const baseSegments = isAdmin
    ? [
        {
          label: "Accueil",
          linkProps: {
            href: "/",
          },
        },
        {
          label: "Maison mère AAP",
          linkProps: { href: `/maison-mere-aap/${maisonMereAAPId}` },
        },
      ]
    : [
        {
          label: "Paramètres",
          linkProps: { href: "/agencies-settings-v3" },
        },
      ];

  return (
    <Breadcrumb
      currentPageLabel={currentPageLabel}
      segments={[...baseSegments, ...segmentsAfterBaseSegments]}
    />
  );
};
