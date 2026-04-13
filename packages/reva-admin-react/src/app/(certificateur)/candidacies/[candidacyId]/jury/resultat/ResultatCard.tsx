import Badge from "@codegouvfr/react-dsfr/Badge";
import { format } from "date-fns";

import { JuryResult } from "@/graphql/generated/graphql";

const juryResultLabels: { [key in JuryResult]: string } = {
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

type JuryType = {
  id: string;
  dateOfSession: number;
  result: JuryResult;
  informationOfResult?: string | null;
};

interface Props {
  jury: JuryType;
}

export const ResultatCard = (props: Props) => {
  const { jury } = props;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <dt className="font-bold mb-4">
          {`${format(jury.dateOfSession, "dd MMMM yyyy")} - Résultat :`}
        </dt>
        <dd>
          <Badge severity={juryResultNotice[jury.result as JuryResult]}>
            {juryResultLabels[jury.result as JuryResult]}
          </Badge>
        </dd>
      </div>

      <div>
        <dt className="font-bold">
          Information complémentaire liée au résultat :
        </dt>
        <dd>{jury.informationOfResult || "Non renseigné"}</dd>
      </div>
    </div>
  );
};
