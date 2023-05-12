import { LegalStatus } from "@prisma/client";

export const subreqSampleMin = {
  companySiret: "1234888",
  companyLegalStatus: LegalStatus.SAS,
  companyName: "Jojo formation",
  companyAddress: "64 boulevard du Général Leclerc",
  companyZipCode: "35660",
  companyCity: "Fougères",
  companyBillingContactFirstname: "Josette",
  companyBillingContactLastname: "Lacomptable",
  companyBillingEmail: "billingjosette@jojo-formation.fr",
  companyBillingPhoneNumber: "03214556789",
  accountFirstname: "Jojo",
  accountLastname: "Landouille",
  accountEmail: "contact@jojo-formation.fr",
  accountPhoneNumber: "03214556789",
  qualiopiCertificateExpiresAt: new Date(2142, 0, 1),
};
