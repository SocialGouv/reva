export type LegalStatus = "EI" | "EURL" | "SARL" | "SAS" | "SASU" | "SA";

export interface SubscriptionRequestInput {
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

export type SubscriptionRequest = SubscriptionRequestInput & { id: string };
