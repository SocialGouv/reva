import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { useRouter } from "next/navigation";

const ToSendBadge = () => (
  <Badge severity="warning" data-testid="to-send-badge">
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

  const getDesc = () => {
    if (candidacyAlreadySubmitted) {
      return "Consulter";
    }
    if (canSubmitCandidacy) {
      return "Vérifier et envoyer";
    }
    return "Compléter toutes les sections";
  };

  const getStartContent = () => {
    if (candidacyAlreadySubmitted) {
      return undefined;
    }
    if (canSubmitCandidacy) {
      return <ToSendBadge />;
    }
    return undefined;
  };

  return (
    <Tile
      data-testid="submit-candidacy-tile"
      start={getStartContent()}
      disabled={!candidacyAlreadySubmitted && !canSubmitCandidacy}
      title="Envoi de la candidature"
      small
      imageSvg
      buttonProps={{
        onClick: () => {
          router.push("./submit-candidacy");
        },
      }}
      imageUrl="/candidat/images/pictograms/mail-send.svg"
      desc={getDesc()}
      className="h-[200px]"
    />
  );
};
