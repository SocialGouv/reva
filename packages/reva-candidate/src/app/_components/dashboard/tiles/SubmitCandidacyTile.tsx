import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";
import router from "next/router";

const SentToSendBadge = ({ isComplete }: { isComplete: boolean }) => (
  <Badge severity={isComplete ? "success" : "warning"}>
    {isComplete ? "Envoyée" : "à envoyer"}
  </Badge>
);

export const SubmitCandidacyTile = ({
  candidacyAlreadySubmitted,
  canSubmitCandidacy,
}: {
  candidacyAlreadySubmitted: boolean;
  canSubmitCandidacy: boolean;
}) => (
  <Tile
    start={<SentToSendBadge isComplete={candidacyAlreadySubmitted} />}
    disabled={!candidacyAlreadySubmitted && !canSubmitCandidacy}
    title="Envoi de la candidature"
    small
    buttonProps={{
      onClick: () => {
        router.push("/submit-candidacy");
      },
    }}
    imageUrl="/candidat/images/pictograms/mail-send.svg"
  />
);
