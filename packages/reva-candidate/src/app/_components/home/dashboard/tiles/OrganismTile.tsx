import Tag from "@codegouvfr/react-dsfr/Tag";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { useRouter } from "next/navigation";

import { CandidacyStatusStep } from "@/graphql/generated/graphql";

import { IncompleteBadge } from "./IncompleteBadge";

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

  const isParcoursConfirme = candidacyStatus === "PARCOURS_CONFIRME";

  const tileDisabled =
    isParcoursConfirme ||
    (candidacyStatus !== "PROJET" &&
      candidacyStatus !== "VALIDATION" &&
      candidacyStatus !== "PRISE_EN_CHARGE" &&
      candidacyStatus !== "PARCOURS_ENVOYE") ||
    !hasSelectedCertification ||
    endAccompagnementConfirmed;

  const canModifyOrganism =
    hasSelectedOrganism && !endAccompagnementConfirmed && !isParcoursConfirme;

  const getStartContent = () => {
    if (endAccompagnementConfirmed) {
      return <Tag small>Accompagnement terminé</Tag>;
    }
    if (!hasSelectedOrganism) {
      return <IncompleteBadge />;
    }
    return undefined;
  };

  const getDesc = () => {
    if (!hasSelectedOrganism || tileDisabled) return undefined;
    return canModifyOrganism ? "Modifier" : "Consulter";
  };

  const commonProps = {
    "data-testid": "organism-tile",
    start: getStartContent(),
    desc: getDesc(),
    title: "Accompagnateur",
    small: true as const,
    imageUrl: "/candidat/images/pictograms/avatar.svg",
    imageSvg: true,
  };

  if (tileDisabled) {
    return (
      <Tile
        {...commonProps}
        disabled
        buttonProps={{ onClick: () => router.push("./set-organism") }}
      />
    );
  }

  return (
    <Tile
      {...commonProps}
      buttonProps={{
        onClick: () => {
          router.push("./set-organism");
        },
      }}
    />
  );
};
