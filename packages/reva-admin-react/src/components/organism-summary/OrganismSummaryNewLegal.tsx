import { format } from "date-fns";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { Info } from "./Info";
import {
  OrganismSummaryLegalInformationDocumentsDecisionProps,
  OrganismSummaryLegalInformationDocumentsDecisions,
} from "./OrganismSummaryLegalInformationDocumentsDecisions";
import { StatutValidationInformationsJuridiquesMaisonMereAap } from "@/graphql/generated/graphql";

export type Typology =
  | "generaliste"
  | "expertBranche"
  | "expertFiliere"
  | "expertBrancheEtFiliere";

const getTypologyLabel = (typology: Typology) => {
  switch (typology) {
    case "expertBranche":
      return "Expert branche";
    case "expertFiliere":
      return "Expert filière";
    case "generaliste":
      return "Généraliste";
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
  companyAddress: string;
  companyZipCode: string;
  companyCity: string;
  companyTypology: Typology;
  ccns?: string[];
  domaines?: string[];
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
  companyQualiopiCertificateExpiresAt,
  companySiret,
  companyLegalStatus,
  companyAddress,
  companyZipCode,
  companyCity,
  companyTypology,
  ccns,
  domaines,
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
    {!!legalInformationDocumentsDecisions.length &&
      statutValidationInformationsJuridiquesMaisonMereAAP ===
        "EN_ATTENTE_DE_VERIFICATION" && (
        <OrganismSummaryLegalInformationDocumentsDecisions
          decisions={legalInformationDocumentsDecisions}
          className="mb-8"
        />
      )}
    <div className="grid grid-cols-2 gap-8">
      <GrayCard>
        <h2>Administrateur du compte France VAE</h2>
        <div className="grid md:grid-cols-2">
          <Info title="Nom">
            {accountFirstname} {accountLastname}
          </Info>
          <Info title="Adresse email" className="break-words">
            {accountEmail}
          </Info>
          <Info title="Téléphone">{accountPhoneNumber}</Info>
          <Info title="Site internet de la structure">
            {companyWebsite || "Non spécifié"}
          </Info>
        </div>
      </GrayCard>
      <GrayCard>
        <h2>Informations juridiques de la structure</h2>
        <div className="grid md:grid-cols-2">
          <Info title="SIRET de la structure">{companySiret}</Info>
          <Info
            title="Forme juridique
"
          >
            {companyLegalStatus}
          </Info>
          <Info
            title="Adresse de la structure
"
          >
            {companyAddress} {companyZipCode} {companyCity}
          </Info>
        </div>
      </GrayCard>
      <GrayCard>
        <h2>Dirigeant</h2>
        <div className="grid md:grid-cols-2">
          <Info title="Prénom">{companyManagerFirstname}</Info>
          <Info title="Nom">{companyManagerLastname}</Info>
        </div>
      </GrayCard>
      <GrayCard>
        <h2>Qualiopi</h2>
        <div className="grid md:grid-cols-2">
          <Info title="Date d'expiration">
            {format(companyQualiopiCertificateExpiresAt, "dd/MM/yyyy")}
          </Info>
        </div>
      </GrayCard>
      <GrayCard className="col-span-2">
        <h2>Typologie</h2>
        <div className="grid md:grid-cols-2">
          <Info title="Typologie">{getTypologyLabel(companyTypology)}</Info>
          {!!domaines?.length && (
            <Info title="Filière(s)">
              <ul className="ml-4">
                {domaines?.map((d) => (
                  <li className="list-disc" key={d}>
                    {d}
                  </li>
                ))}
              </ul>
            </Info>
          )}
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
