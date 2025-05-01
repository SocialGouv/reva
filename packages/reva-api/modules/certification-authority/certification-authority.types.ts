export interface CertificationAuthority {
  id: string;
  label: string;
  contactFullName: string | null;
  contactEmail: string | null;
}

export interface CertificationAuthorityOrLocalAccount {
  id: string;
  certificationAuthorityid: string;
  label: string;
  email: string;
  type: "CERTIFICATION_AUTHORITY" | "CERTIFICATION_AUTHORITY_LOCAL_ACCOUNT";
}

export interface CreateCertificationAuthorityLocalAccountInput {
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
  departmentIds: string[];
  certificationIds: string[];
  certificationAuthorityKeycloakId: string;
  contactFullName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export interface UpdateCertificationAuthorityLocalAccountInput {
  certificationAuthorityLocalAccountId: string;
  contactFullName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  departmentIds: string[];
  certificationIds: string[];
}
