import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";

export const CertificationAuthorityStructureBreadcrumb = ({
  certificationAuthorityStructureId,
  certificationAuthorityStructureLabel,
  pageLabel,
}: {
  certificationAuthorityStructureId: string;
  certificationAuthorityStructureLabel: string;
  pageLabel: string;
}) => (
  <Breadcrumb
    currentPageLabel={pageLabel}
    homeLinkProps={{
      href: `/`,
    }}
    segments={[
      {
        label: "Annuaire certificateurs",
        linkProps: {
          href: `/certification-authority-structures/`,
        },
      },
      {
        label: certificationAuthorityStructureLabel,
        linkProps: {
          href: `/certification-authority-structures/${certificationAuthorityStructureId}/`,
        },
      },
    ]}
  />
);
