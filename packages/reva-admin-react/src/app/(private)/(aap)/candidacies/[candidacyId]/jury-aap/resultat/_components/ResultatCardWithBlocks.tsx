import Badge from "@codegouvfr/react-dsfr/Badge";
import { format } from "date-fns";
import { type ReactNode } from "react";

import { JuryResult } from "@/graphql/generated/graphql";

type JuryTypeWithBlocks = {
  id: string;
  dateOfSession: number;
  result: JuryResult;
  informationOfResult?: string | null;
  juryResultByCompetenceBlocs?:
    | {
        competenceBloc: {
          id: string;
          code?: string | null;
          label: string;
        };
        isCompetenceBlocValidated: boolean;
      }[]
    | null;
};

const juryResultLabels: { [key in JuryResult]: string } = {
  FULL_SUCCESS_OF_FULL_CERTIFICATION: "Réussite totale",
  PARTIAL_SUCCESS_OF_FULL_CERTIFICATION: "Réussite partielle",
  FULL_SUCCESS_OF_PARTIAL_CERTIFICATION: "Réussite totale",
  PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION: "Réussite partielle",
  PARTIAL_SUCCESS_PENDING_CONFIRMATION:
    "Réussite partielle (sous reserve de confirmation par un certificateur)",
  FAILURE: "Non validation",
  CANDIDATE_EXCUSED: "Excusé sur justificatif",
  CANDIDATE_ABSENT: "Non présent le jour du jury",
};

const juryResultLabelsWithoutBlocks: { [key in JuryResult]: string } = {
  FULL_SUCCESS_OF_FULL_CERTIFICATION:
    "Réussite totale à une certification visée en totalité",
  PARTIAL_SUCCESS_OF_FULL_CERTIFICATION:
    "Réussite partielle à une certification visée en totalité",
  FULL_SUCCESS_OF_PARTIAL_CERTIFICATION:
    "Réussite totale aux blocs de compétences visés",
  PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION:
    "Réussite partielle aux blocs de compétences visés",
  PARTIAL_SUCCESS_PENDING_CONFIRMATION:
    "Réussite partielle (sous reserve de confirmation par un certificateur)",
  FAILURE: "Non validation",
  CANDIDATE_EXCUSED: "Candidat excusé sur justificatif",
  CANDIDATE_ABSENT: "Candidat non présent",
};

const juryResultNotice: {
  [key in JuryResult]: "info" | "new" | "success" | "error";
} = {
  FULL_SUCCESS_OF_FULL_CERTIFICATION: "success",
  PARTIAL_SUCCESS_OF_FULL_CERTIFICATION: "info",
  FULL_SUCCESS_OF_PARTIAL_CERTIFICATION: "success",
  PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION: "info",
  PARTIAL_SUCCESS_PENDING_CONFIRMATION: "info",
  FAILURE: "error",
  CANDIDATE_EXCUSED: "new",
  CANDIDATE_ABSENT: "new",
};

interface Props {
  jury: JuryTypeWithBlocks;
  previouslyValidatedBlocks?:
    | {
        id: string;
        code?: string | null;
        label: string;
      }[]
    | null;
  additionalInformation?: ReactNode;
}

export const ResultatCardWithBlocks = (props: Props) => {
  const { jury, previouslyValidatedBlocks, additionalInformation } = props;
  const hasBlocksToShow =
    jury.juryResultByCompetenceBlocs &&
    jury.juryResultByCompetenceBlocs.length > 0;

  return (
    <div className="flex flex-col">
      <Badge severity={juryResultNotice[jury.result]} className="mb-4">
        {hasBlocksToShow
          ? juryResultLabels[jury.result]
          : juryResultLabelsWithoutBlocks[jury.result]}
      </Badge>
      {additionalInformation && (
        <div className="mt-2 mb-6">{additionalInformation}</div>
      )}
      <div className="flex flex-row justify-between border-t py-2 px-4">
        <dt>Passage devant le jury :</dt>
        <dd className="font-bold">
          {format(jury.dateOfSession, "dd/MM/yyyy")}
        </dd>
      </div>
      {hasBlocksToShow && (
        <div className="flex flex-row border-t py-2 px-4 gap-6">
          <dt className="min-w-40 font-medium">Blocs visés :</dt>
          <dd>
            <ul className="list-none">
              {previouslyValidatedBlocks?.map((block) => (
                <li
                  key={block.id}
                  className="mb-1 last:mb-0"
                  role="listitem"
                  aria-label={`${block.code} - ${block.label} (validé)`}
                >
                  <i
                    aria-hidden="true"
                    className="fr-icon-checkbox-fill fr-icon--sm text-gray-700"
                  />
                  <span className="ml-1">
                    {block.code} - {block.label}
                  </span>
                </li>
              ))}
              {jury.juryResultByCompetenceBlocs?.map((block) => (
                <li
                  key={block.competenceBloc.id}
                  className="mb-1 last:mb-0"
                  role="listitem"
                  aria-label={`${block.competenceBloc.code} - ${block.competenceBloc.label} (${block.isCompetenceBlocValidated ? "validé" : "non validé"})`}
                >
                  {block.isCompetenceBlocValidated ? (
                    <i
                      aria-hidden="true"
                      className="fr-icon-checkbox-fill fr-icon--sm text-green-700"
                    />
                  ) : (
                    <i
                      aria-hidden="true"
                      className="fr-icon-close-circle-fill fr-icon--sm text-red-500"
                    />
                  )}
                  <span className="ml-1">
                    {block.competenceBloc.code} - {block.competenceBloc.label}
                  </span>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      )}
      <div className="flex flex-row border-y py-2 px-4 gap-6">
        <dt className="min-w-40 font-medium">Commentaire :</dt>
        <dd className="w-full">
          {jury.informationOfResult || "Non renseigné"}
        </dd>
      </div>
    </div>
  );
};
