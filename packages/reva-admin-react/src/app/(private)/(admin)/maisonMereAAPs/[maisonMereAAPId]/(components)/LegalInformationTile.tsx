import Badge, { type BadgeProps } from "@codegouvfr/react-dsfr/Badge";
import Conclusion from "@codegouvfr/react-dsfr/picto/Conclusion";
import { Tile } from "@codegouvfr/react-dsfr/Tile";

import { StatutValidationInformationsJuridiquesMaisonMereAap } from "@/graphql/generated/graphql";

const BADGES: Record<
  StatutValidationInformationsJuridiquesMaisonMereAap,
  { label: string; severity: BadgeProps["severity"] }
> = {
  A_JOUR: { label: "Compte à jour", severity: "success" },
  A_METTRE_A_JOUR: {
    label: "Demande de mise à jour en attente",
    severity: "warning",
  },
  EN_ATTENTE_DE_VERIFICATION: {
    label: "En attente de vérification",
    severity: "info",
  },
};

export const LegalInformationTile = ({
  maisonMereAAPId,
  statutValidationInformationsJuridiquesMaisonMereAAP,
}: {
  maisonMereAAPId: string;
  statutValidationInformationsJuridiquesMaisonMereAAP: StatutValidationInformationsJuridiquesMaisonMereAap;
}) => {
  const badge = BADGES[statutValidationInformationsJuridiquesMaisonMereAAP];

  return (
    <Tile
      className="col-span-2"
      title="Mise à jour du compte"
      desc="Vous pouvez demander une mise à jour des informations générales relatives à ce compte ou faire des modifications afin d’aider une structure accompagnatrice dans sa démarche. Ces structures ont la possibilité de faire les mises à jour de leurs informations depuis leur espace avec la possibilité de transmettre leurs pièces justificatives."
      start={<Badge severity={badge.severity}>{badge.label}</Badge>}
      pictogram={<Conclusion />}
      small
      orientation="horizontal"
      enlargeLinkOrButton
      linkProps={{
        href: `/maisonMereAAPs/${maisonMereAAPId}/legal-information`,
      }}
    />
  );
};
