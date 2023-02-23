type LegalStatus = "EI" | "EURL" | "SARL" | "SAS" | "SASU" | "SA" | "NC";

interface SubscriptionRequestInput {
  companyName: string;
  companyLegalStatus: LegalStatus;
  companySiret: string;
  companyAddress: string;
  companyBillingAddress: string;
  companyBillingEmail: string;
  companyBic: string;
  companyIban: string;
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
  accountPhoneNumber: string;
}

interface SubscriptionRequest extends SubscriptionRequestInput {
  id: string;
}

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
