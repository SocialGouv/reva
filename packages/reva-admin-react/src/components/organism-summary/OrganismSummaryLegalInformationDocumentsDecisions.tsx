import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { formatDate } from "date-fns";

import { MaisonMereAapLegalInformationDocumentsDecisionEnum } from "@/graphql/generated/graphql";

import { Info } from "./Info";

export interface OrganismSummaryLegalInformationDocumentsDecisionProps {
  id: string;
  internalComment: string;
  aapComment: string;
  aapUpdatedDocumentsAt: Date;
  decision: MaisonMereAapLegalInformationDocumentsDecisionEnum;
  decisionTakenAt: Date;
}

export const OrganismSummaryLegalInformationDocumentsDecisions = ({
  label,
  decisions,
  className,
}: {
  label: string;
  decisions: OrganismSummaryLegalInformationDocumentsDecisionProps[];
  className?: string;
}) => (
  <Accordion label={label} className={`${className || ""}`}>
    <div className="flex flex-col">
      {decisions.map((d) => (
        <OrganismSummaryLegalInformationDocumentsDecision
          key={d.id}
          {...d}
          className="pt-4 pb-3 first:border-none last:border-t-[1.5px] first:pt-0"
        />
      ))}
    </div>
  </Accordion>
);

const OrganismSummaryLegalInformationDocumentsDecision = ({
  decisionTakenAt,
  aapComment,
  aapUpdatedDocumentsAt,
  internalComment,
  className,
}: OrganismSummaryLegalInformationDocumentsDecisionProps & {
  className?: string;
}) => (
  <div className={`grid md:grid-cols-2 ${className || ""}`}>
    <Info title="Mise à jour par l'AAP le : ">
      {formatDate(aapUpdatedDocumentsAt, "dd/MM/yyyy")}
    </Info>
    <Info title="Décision prise le : ">
      {formatDate(decisionTakenAt, "dd/MM/yyyy")}
    </Info>
    <Info title="Commentaire de l'AAP : ">{aapComment}</Info>
    <Info title="Commentaire interne : ">{internalComment}</Info>
  </div>
);
