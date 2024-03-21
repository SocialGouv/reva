export interface CertificationAuthority {
  id: string;
  label: string;
  contactFullName: string | null;
  contactEmail: string | null;
}

export interface CertificationAuthorityOrLocalAccount {
  id: string;
  label: string;
  email: string;
  type: "CERTIFICATION_AUTHORITY" | "CERTIFICATION_AUTHORITY_LOCAL_ACCOUNT";
}
