import Tag from "@codegouvfr/react-dsfr/Tag";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { useRouter } from "next/navigation";

import { CandidacyStatusStep } from "@/graphql/generated/graphql";

import { CompleteIncompleteBadge } from "./CompleteIncompleteBadge";

export const OrganismTile = ({
  hasSelectedOrganism,
  candidacyStatus,
  hasSelectedCertification,
  endAccompagnementConfirmed,
}: {
  hasSelectedOrganism: boolean;
  candidacyStatus: CandidacyStatusStep;
  hasSelectedCertification: boolean; // in some cases (vae collective) the candidate can register without selecting a certification
  endAccompagnementConfirmed: boolean;
}) => {
  const router = useRouter();

  const tileDisabled =
    (candidacyStatus !== "PROJET" &&
      candidacyStatus !== "VALIDATION" &&
      candidacyStatus !== "PRISE_EN_CHARGE" &&
      candidacyStatus !== "PARCOURS_ENVOYE") ||
    !hasSelectedCertification ||
    endAccompagnementConfirmed;

  return (
    <Tile
      data-testid="organism-tile"
      start={
        endAccompagnementConfirmed ? (
          <Tag small>Accompagnement terminé</Tag>
        ) : (
          <CompleteIncompleteBadge isComplete={hasSelectedOrganism} />
        )
      }
      title="Accompagnateur"
      small
      buttonProps={{
        onClick: () => {
          router.push("./set-organism");
        },
      }}
      imageUrl="/candidat/images/pictograms/avatar.svg"
      disabled={tileDisabled}
    />
  );
};
