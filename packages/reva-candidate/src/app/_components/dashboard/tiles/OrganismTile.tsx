import Tile from "@codegouvfr/react-dsfr/Tile";
import { useRouter } from "next/navigation";

import { CandidacyStatusStep } from "@/graphql/generated/graphql";

import { CompleteIncompleteBadge } from "./CompleteIncompleteBadge";

export const OrganismTile = ({
  hasSelectedOrganism,
  candidacyStatus,
  hasSelectedCertification,
}: {
  hasSelectedOrganism: boolean;
  candidacyStatus: CandidacyStatusStep;
  hasSelectedCertification: boolean; // in some cases (vae collective) the candidate can register without selecting a certification
}) => {
  const router = useRouter();
  return (
    <Tile
      data-test="organism-tile"
      start={<CompleteIncompleteBadge isComplete={hasSelectedOrganism} />}
      title="Accompagnateur"
      small
      buttonProps={{
        onClick: () => {
          router.push("/set-organism");
        },
      }}
      imageUrl="/candidat/images/pictograms/avatar.svg"
      disabled={
        (candidacyStatus !== "PROJET" &&
          candidacyStatus !== "VALIDATION" &&
          candidacyStatus !== "PRISE_EN_CHARGE" &&
          candidacyStatus !== "PARCOURS_ENVOYE") ||
        !hasSelectedCertification
      }
    />
  );
};
