import Badge from "@codegouvfr/react-dsfr/Badge";
import { format } from "date-fns";

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
  CANDIDATE_EXCUSED: "Non présent le jour du jury",
  CANDIDATE_ABSENT: "Non présent le jour du jury",
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
}

export const ResultatCardWithBlocks = (props: Props) => {
  const { jury } = props;

  return (
    <div className="flex flex-col">
      <Badge severity={juryResultNotice[jury.result]} className="mb-4">
        {juryResultLabels[jury.result]}
      </Badge>
      <div className="flex flex-row justify-between border-t py-2 px-4">
        <dt>Passage devant le jury :</dt>
        <dd className="font-bold">
          {format(jury.dateOfSession, "dd/MM/yyyy")}
        </dd>
      </div>
      {jury.juryResultByCompetenceBlocs &&
        jury.juryResultByCompetenceBlocs.length > 0 && (
          <div className="flex flex-row border-t py-2 px-4 gap-6">
            <dt className="min-w-40 font-medium">Blocs visés :</dt>
            <dd>
              <ul className="list-none">
                {jury.juryResultByCompetenceBlocs.map((block) => (
                  <li key={block.competenceBloc.id} className="mb-1 last:mb-0">
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
