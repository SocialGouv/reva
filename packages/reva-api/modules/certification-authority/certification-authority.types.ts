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
  certificationAuthorityId: string;
  contactFullName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export interface UpdateCertificationAuthorityLocalAccountGeneralInformationInput {
  certificationAuthorityLocalAccountId: string;
  accountFirstname?: string | null;
  accountLastname: string;
  accountEmail: string;
  contactFullName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}
