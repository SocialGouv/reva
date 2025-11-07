import { CertificationAuthority } from "@/graphql/generated/graphql";

export const createCertificationAuthorityEntity = (
  options: Partial<CertificationAuthority> = {},
): CertificationAuthority => {
  return {
    id: options.id || "cert-authority-1",
    label: options.label || "UIMM - Île-de-France",
    contactFullName: options.contactFullName || null,
    contactEmail: options.contactEmail || null,
    contactPhone: options.contactPhone || null,
    certificationAuthorityLocalAccounts: [],
    certificationAuthorityStructures: [],
    certifications: [],
    departments: [],
    regions: [],
    showLocalAccountsContactInfo: false,
    metabaseDashboardIframeUrl: null,
    account: null,
    ...options,
  };
};
