import { CertificationAuthority } from "@/graphql/generated/graphql";

export const createCertificationAuthorityEntity = (
  options: Partial<CertificationAuthority> = {},
): CertificationAuthority => {
  return {
    id: "cert-authority-1",
    label: "UIMM - Île-de-France",
    contactFullName: null,
    contactEmail: null,
    contactPhone: null,
    certificationAuthorityLocalAccounts: [],
    certificationAuthorityStructures: [],
    certifications: [],
    departments: [],
    regions: [],
    showLocalAccountsContactInfo: false,
    metabaseDashboardIframeUrl: null,
    account: null,
    certificationsAndParcours: {
      info: {
        currentPage: 1,
        pageLength: 10,
        totalPages: 1,
        totalRows: 0,
      },
      rows: [],
    },
    ...options,
  };
};
