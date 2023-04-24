type LegalStatus = "EI" | "EURL" | "SARL" | "SAS" | "SASU" | "SA" | "NC";

type OrganismTypology = "generaliste" | "experimentation" | "expertFiliere" | "expertBranche";

interface SubscriptionRequestInput {
  companySiret: string;
  companyLegalStatus: LegalStatus;
  companyName: string;
  companyAddress: string;
  companyZipCode: string;
  companyCity: string;
  companyBillingContactFirstname: string;
  companyBillingContactLastname: string;
  companyBillingEmail: string;
  companyBillingPhoneNumber: string;
  companyBic: string;
  companyIban: string;
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
  accountPhoneNumber: string;
  typology: OrganismTypology;
  domaineIds: string[];
  ccnIds: string[];
}

type SubscriptionRequest = Omit<SubscriptionRequestInput, "domaineIds", "ccnIds"> & {
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
