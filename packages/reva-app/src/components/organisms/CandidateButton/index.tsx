import { Certification } from "../../../interface";
import { MainEvent, State } from "../../../machines/main.machine";
import { Button } from "../../atoms/Button";

interface PageConfig {
  candidacyId?: string;
  certification: Certification;
  send: (event: MainEvent) => {};
}

export const CandidateButton = ({
  candidacyId,
  certification,
  send,
}: PageConfig) => {
  const isNewCandidacy = candidacyId === undefined;
  return (
    <Button
      data-test={`certification-${isNewCandidacy ? "submit" : "save"}`}
      onClick={() =>
        send({
          type: "SUBMIT_CERTIFICATION",
          certification,
        })
      }
      label={isNewCandidacy ? "Candidater" : "Valider"}
      primary
      size="large"
    />
  );
};
