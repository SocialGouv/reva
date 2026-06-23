import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { format } from "date-fns";
import Image from "next/image";
import { useParams } from "next/navigation";

import { CustomErrorBadge } from "@/components/badge/custom-error-badge/CustomErrorBadge";
import { isSentToCandidateOutdatedAfterIncomplete } from "@/utils/feasibilityIncompleteOutdated.util";

const TILE_COMMON_PROPS = {
  orientation: "horizontal" as const,
  titleAs: "h3" as const,
  small: true,
  title: "Vérifier et envoyer le dossier au candidat",
  pictogram: (
    <Image
      src="/admin2/components/mail-send.svg"
      alt="mail send"
      width={40}
      height={40}
    />
  ),
};

export const SendFileCandidateSection = ({
  sentToCandidateAt,
  isReadyToBeSentToCandidate,
  isIncomplete,
  decisionSentAt,
}: {
  sentToCandidateAt?: Date | null;
  isReadyToBeSentToCandidate: boolean;
  isIncomplete?: boolean;
  decisionSentAt?: Date | null;
}) => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const navigationUrl = `/candidacies/${candidacyId}/feasibility-aap/send-file-candidate`;

  const isIncompleteNotResentToCandidate =
    isSentToCandidateOutdatedAfterIncomplete({
      isIncomplete,
      decisionSentAt,
      sentToCandidateAt,
    });

  if (sentToCandidateAt && !isIncompleteNotResentToCandidate) {
    return (
      <Tile
        {...TILE_COMMON_PROPS}
        start={
          <Badge severity="success">
            Dossier envoyé au candidat le{" "}
            {format(sentToCandidateAt, "dd/MM/yyyy")}
          </Badge>
        }
        desc="Vous avez fait de nouvelles modifications sur le dossier ou prévoyez d'en faire ? Vous devrez renvoyer le dossier au candidat afin qu'il valide la nouvelle version."
        detail="voir le dossier"
        linkProps={{ href: navigationUrl }}
        data-testid="send-file-candidate-tile-sent"
      />
    );
  }

  if (isReadyToBeSentToCandidate || isIncompleteNotResentToCandidate) {
    return (
      <Tile
        {...TILE_COMMON_PROPS}
        desc="Le candidat doit valider ce dossier avant que vous puissiez l'envoyer au certificateur."
        linkProps={{ href: navigationUrl }}
        data-testid="send-file-candidate-tile-ready"
      />
    );
  }

  return (
    <Tile
      {...TILE_COMMON_PROPS}
      classes={{
        title:
          "text-dsfr-light-decisions-text-disabled-grey before:bg-gradient-to-t before:from-dsfr-light-decisions-border-border-disabled-grey before:to-dsfr-light-decisions-border-border-disabled-grey",
      }}
      desc="Une fois toutes les sections complétées, vous pourrez envoyer le dossier au candidat. Il devra valider ce dossier avant que vous puissiez l'envoyer au certificateur."
      start={<CustomErrorBadge label="attente de la saisie complète" />}
      style={{
        paddingBottom: "0",
        color: "grey",
      }}
      data-testid="send-file-candidate-tile-uncompleted"
    />
  );
};
