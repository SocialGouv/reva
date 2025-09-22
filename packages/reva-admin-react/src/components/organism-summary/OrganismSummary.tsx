import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { format } from "date-fns";

import { GrayCard } from "@/components/card/gray-card/GrayCard";

import { StatutValidationInformationsJuridiquesMaisonMereAap } from "@/graphql/generated/graphql";

import { CompanyPreview } from "../company-preview/CompanyPreview.component";

import { Info } from "./Info";
import {
  OrganismSummaryLegalInformationDocumentsDecisionProps,
  OrganismSummaryLegalInformationDocumentsDecisions,
} from "./OrganismSummaryLegalInformationDocumentsDecisions";

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

interface OrganismSummaryProps {
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
    <div className="mb-4">
      {statutValidationInformationsJuridiquesMaisonMereAAP === "A_JOUR" && (
        <Badge severity="success">À jour</Badge>
      )}
      {statutValidationInformationsJuridiquesMaisonMereAAP ===
        "A_METTRE_A_JOUR" && (
        <Badge severity="warning">Demande de précisions</Badge>
      )}
    </div>
    <ul>
      {createdAt && (
        <li>Inscription envoyée le {format(createdAt, "dd/MM/yyyy")}</li>
      )}
      {legalInformationDocumentsDecisions.length > 0 && (
        <li>
          {legalInformationDocumentsDecisions[0].decision == "VALIDE"
            ? "Mise à jour validée le "
            : "Demande de précision envoyée le "}
          {format(
            legalInformationDocumentsDecisions[0].decisionTakenAt,
            "dd/MM/yyyy",
          )}
        </li>
      )}
    </ul>
    {!!legalInformationDocumentsDecisions.length && (
      <OrganismSummaryLegalInformationDocumentsDecisions
        label={
          statutValidationInformationsJuridiquesMaisonMereAAP === "A_JOUR"
            ? "Historique des décisions"
            : "Décisions précédentes"
        }
        decisions={legalInformationDocumentsDecisions}
        className="mb-8"
      />
    )}
    <div className="grid grid-cols-2 gap-8">
      <CompanyPreview
        className="col-span-2"
        company={{
          companySiret,
          companyName,
          companyLegalStatus,
          companyWebsite,
        }}
        manager={{
          managerFirstname: companyManagerFirstname,
          managerLastname: companyManagerLastname,
        }}
        account={{
          accountEmail,
          accountPhoneNumber,
          accountFirstname,
          accountLastname,
        }}
      />

      <GrayCard className="col-span-2">
        <h2>Typologie</h2>
        <div className="grid md:grid-cols-2">
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
