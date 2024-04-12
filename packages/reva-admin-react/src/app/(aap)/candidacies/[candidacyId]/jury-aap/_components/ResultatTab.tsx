import { JuryResult } from "@/graphql/generated/graphql";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { format } from "date-fns";
import { useJuryAAP } from "./jury-aap.hook";

const juryResultLabels: { [key in JuryResult]: string } = {
  FULL_SUCCESS_OF_FULL_CERTIFICATION:
    "Réussite totale à une certification visée en totalité",
  PARTIAL_SUCCESS_OF_FULL_CERTIFICATION:
    "Réussite partielle à une certification visée en totalité",
  FULL_SUCCESS_OF_PARTIAL_CERTIFICATION:
    "Réussite totale aux blocs de compétences visés",
  PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION:
    "Réussite partielle aux blocs de compétences visés",
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
  FAILURE: "error",
  CANDIDATE_EXCUSED: "new",
  CANDIDATE_ABSENT: "new",
};

export const ResultatTab = () => {
  const { candidacy } = useJuryAAP();
  const jury = candidacy?.jury;
  const hasResult = jury?.result !== null;

  if (!hasResult) {
    return (
      <Alert
        description={
          <div className="pl-2">
            <h6>En attente du résultat</h6>
            <dd>
              Le certificateur vous communiquera le résultat de votre candidat.
            </dd>
          </div>
        }
        severity="info"
        small
      />
    );
  }
  return (
    <div>
      <h2 className="text-xl">
        Résultat à l'issue de l'entretien avec le jury
      </h2>
      <div className="mt-10 mb-4">
        <dt className="font-bold mb-4">
          {`${
            jury?.dateOfSession
              ? format(jury?.dateOfSession, "dd MMMM yyyy")
              : ""
          } - Résultat :`}
        </dt>
        <dd>
          {jury?.result && (
            <Badge severity={juryResultNotice[jury.result as JuryResult]}>
              {juryResultLabels[jury.result as JuryResult]}
            </Badge>
          )}
        </dd>
      </div>
      <div>
        <dt className="font-bold">
          Information complémentaire liée au résultat :
        </dt>
        <dd>{jury?.informationOfResult || "Non renseigné"}</dd>
      </div>
    </div>
  );
};
