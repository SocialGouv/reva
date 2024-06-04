import { format } from "date-fns";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { Info } from "./Info";
import {
  OrganismSummaryLegalInformationDocumentsDecisionProps,
  OrganismSummaryLegalInformationDocumentsDecisions,
} from "./OrganismSummaryLegalInformationDocumentsDecisions";
import { StatutValidationInformationsJuridiquesMaisonMereAap } from "@/graphql/generated/graphql";
import { CompanyPreview } from "../company-preview";

export type Typology =
  | "expertBranche"
  | "expertFiliere"
  | "expertBrancheEtFiliere";

const getTypologyLabel = (typology: Typology) => {
  switch (typology) {
    case "expertBranche":
      return "Expert branche";
    case "expertFiliere":
      return "Expert filière";
    case "expertBrancheEtFiliere":
      return "Expert branche et filière";
  }
};

export interface OrganismSummaryProps {
  companyName: string;
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
  accountPhoneNumber: string;
  companyWebsite?: string | null;
  companyQualiopiCertificateExpiresAt: Date;
  companySiret: string;
  companyLegalStatus: string;
  companyTypology: Typology;
  ccns?: string[];
  createdAt?: Date;
  companyManagerFirstname?: string;
  companyManagerLastname?: string;
  legalInformationDocumentsDecisions: OrganismSummaryLegalInformationDocumentsDecisionProps[];
  statutValidationInformationsJuridiquesMaisonMereAAP: StatutValidationInformationsJuridiquesMaisonMereAap;
}

export const OrganismSummary = ({
  companyName,
  accountFirstname,
  accountLastname,
  accountEmail,
  accountPhoneNumber,
  companyWebsite,
  companySiret,
  companyLegalStatus,
  companyTypology,
  ccns,
  createdAt,
  companyManagerFirstname,
  companyManagerLastname,
  legalInformationDocumentsDecisions,
  statutValidationInformationsJuridiquesMaisonMereAAP,
}: OrganismSummaryProps) => (
  <>
    <h1>{companyName}</h1>

    {createdAt && (
      <p>AAP inscrit depuis le {format(createdAt, "dd/MM/yyyy")}</p>
    )}
    {statutValidationInformationsJuridiquesMaisonMereAAP === "A_JOUR" && (
      <Badge className="mb-8" severity="success">
        À JOUR
      </Badge>
    )}
    {statutValidationInformationsJuridiquesMaisonMereAAP ===
      "A_METTRE_A_JOUR" && (
      <Badge className="mb-8" severity="warning">
        DEMANDE DE PRÉCISIONS
      </Badge>
    )}
    {!!legalInformationDocumentsDecisions.length && (
      <OrganismSummaryLegalInformationDocumentsDecisions
        decisions={legalInformationDocumentsDecisions}
        className="mb-8"
      />
    )}

    <div className="grid grid-cols-2 gap-8">
      <CompanyPreview
        className="col-span-2"
        companySiret={companySiret}
        companyName={companyName}
        companyLegalStatus={companyLegalStatus}
        companyWebsite={companyWebsite}
        managerFirstname={companyManagerFirstname}
        managerLastname={companyManagerLastname}
        accountEmail={accountEmail}
        accountPhoneNumber={accountPhoneNumber}
        accountFirstname={accountFirstname}
        accountLastname={accountLastname}
      />

      <GrayCard className="col-span-2">
        <h2>Typologie</h2>
        <div className="grid col-span-2">
          <Info title="Typologie">{getTypologyLabel(companyTypology)}</Info>
          {!!ccns?.length && (
            <Info title="Conventions collectives">
              <ul className="ml-4">
                {ccns?.map((c) => (
                  <li className="list-disc" key={c}>
                    {c}
                  </li>
                ))}
              </ul>
            </Info>
          )}
        </div>
      </GrayCard>
    </div>
  </>
);
