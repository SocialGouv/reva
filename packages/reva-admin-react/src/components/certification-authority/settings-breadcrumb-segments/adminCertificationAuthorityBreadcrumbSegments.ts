import { BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";

type BreadcrumbSegments = BreadcrumbProps["segments"];

export const getCertificationAuthorityStructureBreadcrumbSegments = ({
  certificationAuthorityStructureId,
  certificationAuthorityStructureLabel,
}: {
  certificationAuthorityStructureId: string;
  certificationAuthorityStructureLabel: string;
}): BreadcrumbSegments => [
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

export const getAdminCertificationAuthorityBreadcrumbSegments = ({
  certificationAuthorityStructureId,
  certificationAuthorityStructureLabel,
  certificationAuthorityId,
  certificationAuthorityLabel,
}: {
  certificationAuthorityStructureId: string;
  certificationAuthorityStructureLabel: string;
  certificationAuthorityId: string;
  certificationAuthorityLabel: string;
}): BreadcrumbSegments => [
  ...getCertificationAuthorityStructureBreadcrumbSegments({
    certificationAuthorityStructureId,
    certificationAuthorityStructureLabel,
  }),
  {
    label: certificationAuthorityLabel,
    linkProps: {
      href: `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/`,
    },
  },
];

export const getAdminCertificationAuthorityLocalAccountBreadcrumbSegments = ({
  certificationAuthorityStructureId,
  certificationAuthorityStructureLabel,
  certificationAuthorityId,
  certificationAuthorityLabel,
  certificationAuthorityLocalAccountId,
  certificationAuthorityLocalAccountLabel,
}: {
  certificationAuthorityStructureId: string;
  certificationAuthorityStructureLabel: string;
  certificationAuthorityId: string;
  certificationAuthorityLabel: string;
  certificationAuthorityLocalAccountId: string;
  certificationAuthorityLocalAccountLabel: string;
}): BreadcrumbSegments => [
  ...getAdminCertificationAuthorityBreadcrumbSegments({
    certificationAuthorityStructureId,
    certificationAuthorityStructureLabel,
    certificationAuthorityId,
    certificationAuthorityLabel,
  }),
  {
    label: certificationAuthorityLocalAccountLabel,
    linkProps: {
      href: `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/comptes-collaborateurs/${certificationAuthorityLocalAccountId}/`,
    },
  },
];
