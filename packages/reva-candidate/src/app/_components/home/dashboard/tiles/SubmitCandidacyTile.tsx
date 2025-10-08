import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { useRouter } from "next/navigation";

const SentBadge = () => (
  <Badge severity="success" data-test="sent-badge">
    Envoyée
  </Badge>
);

const ToSendBadge = () => (
  <Badge severity="warning" data-test="to-send-badge">
    à envoyer
  </Badge>
);

export const SubmitCandidacyTile = ({
  candidacyAlreadySubmitted,
  canSubmitCandidacy,
}: {
  candidacyAlreadySubmitted: boolean;
  canSubmitCandidacy: boolean;
}) => {
  const router = useRouter();

  return (
    <Tile
      data-test="submit-candidacy-tile"
      start={
        <>
          {candidacyAlreadySubmitted ? (
            <SentBadge />
          ) : (
            canSubmitCandidacy && <ToSendBadge />
          )}
        </>
      }
      disabled={!candidacyAlreadySubmitted && !canSubmitCandidacy}
      title="Envoi de la candidature"
      small
      buttonProps={{
        onClick: () => {
          router.push("./submit-candidacy");
        },
      }}
      imageUrl="/candidat/images/pictograms/mail-send.svg"
      desc={
        candidacyAlreadySubmitted || canSubmitCandidacy
          ? ""
          : "Compléter toutes les sections"
      }
    />
  );
};
