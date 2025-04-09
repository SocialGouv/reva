import { useRouter } from "next/navigation";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { CompleteIncompleteBadge } from "./CompleteIncompleteBadge";
import { CandidacyStatusStep } from "@/graphql/generated/graphql";

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
  console.log("candidacyStatus", candidacyStatus);
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
