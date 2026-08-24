import Badge, { type BadgeProps } from "@codegouvfr/react-dsfr/Badge";
import Conclusion from "@codegouvfr/react-dsfr/picto/Conclusion";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { format } from "date-fns";

import { StatutValidationInformationsJuridiquesMaisonMereAap } from "@/graphql/generated/graphql";

type TileContent = {
  severity: BadgeProps["severity"];
  badgeLabel: string;
  title: string;
  desc: string;
  detail?: string;
};

type TileContentInput = {
  statutValidationInformationsJuridiquesMaisonMereAAP: StatutValidationInformationsJuridiquesMaisonMereAap;
  updateRequestedAt?: Date | null;
  documentsSubmittedAt?: Date | null;
};

// Repli quand la date attendue par la maquette n'existe pas: une structure vient
// d'être inscrite (A_METTRE_A_JOUR par défaut, sans décision) ou son dossier est à jour.
const ADMIN_DEFAULT_CONTENT: TileContent = {
  severity: "success",
  badgeLabel: "Compte à jour",
  title: "Mise à jour du compte",
  desc: "Vous pouvez demander une mise à jour des informations générales relatives à ce compte ou faire des modifications afin d’aider une structure accompagnatrice dans sa démarche. Ces structures ont la possibilité de faire les mises à jour de leurs informations depuis leur espace avec la possibilité de transmettre leurs pièces justificatives.",
};

const AAP_DEFAULT_CONTENT: TileContent = {
  severity: "success",
  badgeLabel: "Compte à jour",
  title: "Mise à jour du compte",
  desc: "Vos informations générales sont à jour. France VAE vous contactera si une mise à jour est nécessaire.",
};

const getAdminTileContent = ({
  statutValidationInformationsJuridiquesMaisonMereAAP,
  updateRequestedAt,
}: TileContentInput): TileContent => {
  if (
    statutValidationInformationsJuridiquesMaisonMereAAP === "A_METTRE_A_JOUR" &&
    updateRequestedAt
  ) {
    return {
      severity: "warning",
      badgeLabel: "Demande de mise à jour en attente",
      title: "Mise à jour du compte",
      desc: `Un administrateur France VAE a demandé une mise à jour totale des informations le ${format(updateRequestedAt, "dd/MM/yyyy")}`,
    };
  }

  if (
    statutValidationInformationsJuridiquesMaisonMereAAP ===
    "EN_ATTENTE_DE_VERIFICATION"
  ) {
    return {
      severity: "info",
      badgeLabel: "En attente de vérification",
      title: "Mise à jour du compte",
      desc: "Une demande de mise à jour est en attente de vérification. Vous devez vérifier cette demande avant d'en faire une autre.",
      detail: "Vérifier cette demande",
    };
  }

  return ADMIN_DEFAULT_CONTENT;
};

const getAapTileContent = ({
  statutValidationInformationsJuridiquesMaisonMereAAP,
  documentsSubmittedAt,
}: TileContentInput): TileContent => {
  if (
    statutValidationInformationsJuridiquesMaisonMereAAP === "A_METTRE_A_JOUR"
  ) {
    return {
      severity: "warning",
      badgeLabel: "À mettre à jour",
      title: "Mise à jour du compte",
      desc: "France VAE a procédé à une demande de mise à jour concernant votre compte. Afin de conserver l’accès à votre espace, veuillez compléter cette demande.",
      detail: "Consulter les documents nécessaires et compléter la demande",
    };
  }

  if (
    statutValidationInformationsJuridiquesMaisonMereAAP ===
    "EN_ATTENTE_DE_VERIFICATION"
  ) {
    return {
      severity: "info",
      badgeLabel: "En attente de vérification",
      title: documentsSubmittedAt
        ? `Demande de modification envoyée le ${format(documentsSubmittedAt, "dd/MM/yyyy")}`
        : "Demande de modification envoyée",
      desc: "Votre demande est en cours de vérification par un administrateur France VAE.",
    };
  }

  return AAP_DEFAULT_CONTENT;
};

export const LegalInformationTile = ({
  isAdmin,
  href,
  statutValidationInformationsJuridiquesMaisonMereAAP,
  updateRequestedAt,
  documentsSubmittedAt,
}: {
  isAdmin: boolean;
  // Sans destination, la tuile est une simple carte d'information: c'est la page
  // hôte qui décide si un lien a du sens depuis l'écran affiché.
  href?: string;
  statutValidationInformationsJuridiquesMaisonMereAAP: StatutValidationInformationsJuridiquesMaisonMereAap;
  updateRequestedAt?: Date | null;
  documentsSubmittedAt?: Date | null;
}) => {
  const getTileContent = isAdmin ? getAdminTileContent : getAapTileContent;
  const { severity, badgeLabel, title, desc, detail } = getTileContent({
    statutValidationInformationsJuridiquesMaisonMereAAP,
    updateRequestedAt,
    documentsSubmittedAt,
  });

  const commonProps = {
    title,
    desc,
    detail,
    start: <Badge severity={severity}>{badgeLabel}</Badge>,
    pictogram: <Conclusion />,
    small: true,
    orientation: "horizontal" as const,
  };

  // Deux branches explicites: TileProps.Unclickable interdit enlargeLinkOrButton,
  // un href optionnel étalé conditionnellement ne compilerait pas.
  return href ? (
    <Tile {...commonProps} enlargeLinkOrButton linkProps={{ href }} />
  ) : (
    <Tile {...commonProps} />
  );
};
