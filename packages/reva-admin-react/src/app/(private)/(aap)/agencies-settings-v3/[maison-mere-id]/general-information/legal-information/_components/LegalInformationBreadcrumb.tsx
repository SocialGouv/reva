import { SettingsBreadcrumb } from "@/components/settings/settings-breadcrumb/SettingsBreadcrumb";

export const LegalInformationBreadcrumb = ({
  maisonMereAAPId,
  raisonSociale,
}: {
  maisonMereAAPId: string;
  raisonSociale?: string | null;
}) => (
  <SettingsBreadcrumb
    currentPageLabel="Mise à jour des informations générales"
    homeLinkProps={{ href: "/" }}
    segments={[
      {
        label: "Structures accompagnatrices",
        linkProps: { href: "/maison-mere-aap" },
      },
      {
        label: raisonSociale ?? "Structure",
        linkProps: { href: `/maison-mere-aap/${maisonMereAAPId}` },
      },
      {
        label: "Informations générales",
        linkProps: {
          href: `/agencies-settings-v3/${maisonMereAAPId}/general-information`,
        },
      },
    ]}
  />
);
