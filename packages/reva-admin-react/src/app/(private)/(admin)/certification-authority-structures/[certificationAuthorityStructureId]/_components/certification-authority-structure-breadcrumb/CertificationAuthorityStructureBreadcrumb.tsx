import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";

type BreadcrumbsProps =
  | {
      certificationAuthorityStructureId: string;
      certificationAuthorityStructureLabel: string;
      certificationAuthorityId?: never;
      certificationAuthoritylabel?: never;
      pageLabel: string;
    }
  | {
      certificationAuthorityStructureId: string;
      certificationAuthorityStructureLabel: string;
      certificationAuthorityId: string;
      certificationAuthoritylabel: string;
      pageLabel: string;
    };

export const CertificationAuthorityStructureBreadcrumb = ({
  certificationAuthorityStructureId,
  certificationAuthorityStructureLabel,
  certificationAuthorityId,
  certificationAuthoritylabel,
  pageLabel,
}: BreadcrumbsProps) => {
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
  ];
  if (certificationAuthorityId && certificationAuthoritylabel) {
    segments.push({
      label: certificationAuthoritylabel,
      linkProps: {
        href: `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/`,
      },
    });
  }
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
