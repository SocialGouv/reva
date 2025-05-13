import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";

export const AdminCertificationAuthorityLocalAccountBreadcrumb = ({
  certificationAuthorityStructureId,
  certificationAuthorityStructureLabel,
  certificationAuthorityId,
  certificationAuthoritylabel,
  certificationAuthorityLocalAccountId,
  certificationAuthorityLocalAccountLabel,
  pageLabel,
}: {
  certificationAuthorityStructureId: string;
  certificationAuthorityStructureLabel: string;
  certificationAuthorityId: string;
  certificationAuthoritylabel: string;
  certificationAuthorityLocalAccountId: string;
  certificationAuthorityLocalAccountLabel: string;
  pageLabel: string;
}) => {
  const segments = [
    {
      label: "Structures certificatrices",
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
    {
      label: certificationAuthoritylabel,
      linkProps: {
        href: `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/`,
      },
    },
    {
      label: certificationAuthorityLocalAccountLabel,
      linkProps: {
        href: `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/comptes-collaborateurs/${certificationAuthorityLocalAccountId}/`,
      },
    },
  ];

  return (
    <Breadcrumb
      currentPageLabel={pageLabel}
      homeLinkProps={{
        href: `/`,
      }}
      segments={segments}
    />
  );
};
