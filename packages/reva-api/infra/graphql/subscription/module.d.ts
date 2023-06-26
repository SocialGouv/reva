type LegalStatus =
  | "EI"
  | "EURL"
  | "SARL"
  | "SAS"
  | "SASU"
  | "SA"
  | "EIRL"
  | "ASSOCIATION_LOI_1901"
  | "ETABLISSEMENT_PUBLIC"
  | "NC";

type OrganismTypology =
  | "generaliste"
  | "experimentation"
  | "expertFiliere"
  | "expertBranche"
  | "expertBrancheEtFiliere";

interface SubscriptionRequestInput {
  companySiret: string;
  companyLegalStatus: LegalStatus;
  companyName: string;
  companyAddress: string;
  companyZipCode: string;
  companyCity: string;
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
  accountPhoneNumber: string;
  typology: OrganismTypology;
  domaineIds: string[];
  ccnIds: string[];
  onSiteDepartmentsIds: string[];
  remoteDepartmentsIds: string[];
  companyWebsite?: string;
  qualiopiCertificateExpiresAt: Date;
}

interface DepartmentWithOrganismMethods {
  departmentId: string;
  isOnSite: boolean;
  isRemote: boolean;
}

type SubscriptionRequest = Omit<
  SubscriptionRequestInput,
  "domaineIds",
  "ccnIds",
  "onSiteDepartmentsIds",
  "remoteDepartmentsIds"
> & {
  id: string;
  createdAt: Date;
};

type SubscriptionRequestSummary = Pick<
  SubscriptionRequest,
  | "id"
  | "accountLastname"
  | "accountFirstname"
  | "accountEmail"
  | "companyName"
  | "companyAddress"
>;

interface GetSubscriptionRequestsParams extends FilteredPaginatedListArgs {
  orderBy?: {
    companyName?: Sort;
    accountLastname?: Sort;
  };
}
