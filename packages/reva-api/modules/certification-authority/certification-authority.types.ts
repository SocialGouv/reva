export interface CertificationAuthority {
  id: string;
  label: string;
  contactFullName: string | null;
  contactEmail: string | null;
  certificationAuthorityStructureId: string;
}

export interface CertificationAuthorityOrLocalAccount {
  id: string;
  certificationAuthorityid: string;
  label: string;
  email: string;
  type: "CERTIFICATION_AUTHORITY" | "CERTIFICATION_AUTHORITY_LOCAL_ACCOUNT";
}
