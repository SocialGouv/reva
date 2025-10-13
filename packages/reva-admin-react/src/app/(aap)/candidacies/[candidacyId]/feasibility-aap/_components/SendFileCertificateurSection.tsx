import Badge from "@codegouvfr/react-dsfr/Badge";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { format } from "date-fns";
import Image from "next/image";
import { useParams } from "next/navigation";

import { CustomErrorBadge } from "@/components/badge/custom-error-badge/CustomErrorBadge";

const TILE_COMMON_PROPS = {
  orientation: "horizontal" as const,
  titleAs: "h3" as const,
  small: true,
  title: "Vérifier et envoyer le dossier au certificateur",
  pictogram: (
    <Image
      src="/admin2/components/document.svg"
      alt="document"
      width={40}
      height={40}
    />
  ),
};

export const SendFileCertificationAuthoritySection = ({
  sentToCertificationAuthorityAt,
  isReadyToBeSentToCertificationAuthority,
}: {
  sentToCertificationAuthorityAt?: Date | null;
  isReadyToBeSentToCertificationAuthority: boolean;
}) => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const navigationUrl = `/candidacies/${candidacyId}/feasibility-aap/send-file-certification-authority`;
  const feasibilityHasBeenSent = !!sentToCertificationAuthorityAt;

  if (feasibilityHasBeenSent) {
    return (
      <Tile
        {...TILE_COMMON_PROPS}
        start={
          <Badge severity="success">
            Dossier envoyé au certificateur le{" "}
            {format(sentToCertificationAuthorityAt, "dd/MM/yyyy")}
          </Badge>
        }
        desc="Si le certificateur juge que c'est incomplet, il vous le renverra."
        detail="voir le dossier"
        linkProps={{ href: navigationUrl }}
        data-test="send-file-certification-authority-tile-sent"
      />
    );
  }

  if (isReadyToBeSentToCertificationAuthority) {
    return (
      <Tile
        {...TILE_COMMON_PROPS}
        desc="Le candidat a validé son dossier, vous pouvez maintenant vérifier et envoyer le dossier au certificateur."
        linkProps={{ href: navigationUrl }}
        data-test="send-file-certification-authority-tile-ready"
      />
    );
  }

  return (
    <Tile
      {...TILE_COMMON_PROPS}
      disabled
      classes={{
        title:
          "text-dsfr-light-decisions-text-disabled-grey before:bg-gradient-to-t before:from-dsfr-light-decisions-border-border-disabled-grey before:to-dsfr-light-decisions-border-border-disabled-grey",
      }}
      start={
        <CustomErrorBadge label="En attente d’envoi pour validation au candidat" />
      }
      desc="Le candidat doit valider et transmettre une attestation sur l’honneur pour ce dossier avant que vous puissiez l'envoyer au certificateur. Vous serez notifié lorsque le candidat aura effectué cette action."
      data-test="send-file-certification-authority-tile-pending-validation"
      style={{
        paddingBottom: "0",
        color: "grey",
      }}
    />
  );
};
