import { SettingsBreadcrumb } from "@/components/settings/settings-breadcrumb/SettingsBreadcrumb";

export const LegalInformationBreadcrumb = ({
  isAdmin,
  maisonMereAAPId,
  raisonSociale,
}: {
  isAdmin: boolean;
  maisonMereAAPId: string;
  raisonSociale?: string | null;
}) => {
  const generalInformationSegment = {
    label: "Informations générales",
    linkProps: {
      href: `/agencies-settings-v3/${maisonMereAAPId}/general-information`,
    },
  };

  // L'AAP n'a pas accès à /maison-mere-aap: son fil d'Ariane part des paramètres.
  if (!isAdmin) {
    return (
      <SettingsBreadcrumb
        currentPageLabel="Mise à jour des informations générales"
        segments={[
          { label: "Paramètres", linkProps: { href: "/agencies-settings-v3" } },
          generalInformationSegment,
        ]}
      />
    );
  }

  return (
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
        generalInformationSegment,
      ]}
    />
  );
};
