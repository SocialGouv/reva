import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { useRouter } from "next/navigation";

import { candidateCanSubmitCandidacyToAap } from "@/utils/candidateCanSubmitCandidacyToAap.util";

import { CandidacyUseCandidateForDashboard } from "../../dashboard.hooks";
import TileGroup from "../../tiles/TileGroup";

import { NoActionTile } from "./NoContactTile";

interface NextActionTile {
  title: string;
  link?: string;
  action?: () => void;
}

const ROUTES = {
  SET_GOALS: "/set-goals",
  EXPERIENCES: "/experiences",
  SET_ORGANISM: "/set-organism",
  SUBMIT_CANDIDACY: "/submit-candidacy",
  VALIDATE_TRAINING: "/validate-training",
  VALIDATE_FEASIBILITY: "/validate-feasibility",
  DOSSIER_DE_VALIDATION: "/dossier-de-validation",
} as const;

const sendSwornStatementModal = createModal({
  id: "send-sworn-statement",
  isOpenedByDefault: false,
});

const SendSwornStatementModal = () => {
  return (
    <sendSwornStatementModal.Component
      title="Envoi de l'attestation sur l'honneur"
      iconId="fr-icon-send-plane-fill"
    >
      <p>
        Vous avez validé votre dossier de faisabilité sans avoir envoyé votre
        attestation sur l'honneur ?
      </p>
      <p>
        Afin de permettre à votre accompagnateur d'envoyer votre dossier au
        certificateur, vous devez lui faire parvenir votre attestation par mail,
        par courrier ou en main propre afin qu'il puisse l'envoyer à votre
        place.
      </p>
      <p>Si vous rencontrez des problèmes, n'hésitez pas à le contacter.</p>
    </sendSwornStatementModal.Component>
  );
};

const getNextActionTiles = ({
  candidacy,
  openSendSwornStatementModal,
}: {
  candidacy: CandidacyUseCandidateForDashboard;
  openSendSwornStatementModal: () => void;
}): NextActionTile[] => {
  if (!candidacy) return [];

  const isAccompagne = candidacy.typeAccompagnement === "ACCOMPAGNE";
  const candidacyStatus = candidacy.status;
  const isProjectStatus = candidacyStatus === "PROJET";
  const isParcoursEnvoyeStatus = candidacyStatus === "PARCOURS_ENVOYE";

  const goalsCount = candidacy.goals?.length || 0;
  const experiencesCount = candidacy.experiences?.length || 0;
  const hasOrganism = !!candidacy.organism?.id;
  const hasSelectedCertification = !!candidacy.certification?.id;
  const candidacyAlreadySubmitted = !!candidacy.sentAt;

  const feasibilityDecision = candidacy.feasibility?.decision;
  const dossierValidation = candidacy.activeDossierDeValidation;
  const dossierValidationDecision = dossierValidation?.decision;

  const feasibility = candidacy.feasibility;
  const dematerializedFeasibilityFile =
    feasibility?.dematerializedFeasibilityFile;

  const canSubmitCandidacy = candidateCanSubmitCandidacyToAap({
    hasSelectedCertification,
    hasCompletedGoals: goalsCount > 0,
    hasSelectedOrganism: hasOrganism,
    hasCompletedExperience: experiencesCount > 0,
    candidacyAlreadySubmitted,
  });
  const canValidateFeasibility =
    !!dematerializedFeasibilityFile?.sentToCandidateAt &&
    !dematerializedFeasibilityFile?.candidateConfirmationAt;
  const needsSwornAttestationStatement =
    feasibility?.feasibilityFormat === "DEMATERIALIZED" &&
    isAccompagne &&
    !dematerializedFeasibilityFile?.swornStatementFileId &&
    !!dematerializedFeasibilityFile?.candidateConfirmationAt;

  const failedJuryResults = [
    "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
    "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
    "FAILURE",
    "CANDIDATE_EXCUSED",
    "CANDIDATE_ABSENT",
  ];

  const canSubmitAgainAfterJury = failedJuryResults.includes(
    candidacy.jury?.result || "",
  );

  const rules: { condition: boolean; tile: NextActionTile }[] = [
    // Première connexion (ACCOMPAGNE + PROJET)
    {
      condition: isProjectStatus && goalsCount === 0,
      tile: { title: "Remplir mes objectifs", link: ROUTES.SET_GOALS },
    },
    {
      condition: isProjectStatus && experiencesCount === 0,
      tile: { title: "Remplir mes expériences", link: ROUTES.EXPERIENCES },
    },
    {
      condition:
        isProjectStatus &&
        isAccompagne &&
        !hasOrganism &&
        hasSelectedCertification,
      tile: { title: "Choisir mon accompagnateur", link: ROUTES.SET_ORGANISM },
    },

    // Candidature complétée (ACCOMPAGNE + PROJET + prérequis OK)
    {
      condition: canSubmitCandidacy,
      tile: { title: "Envoyer ma candidature", link: ROUTES.SUBMIT_CANDIDACY },
    },

    // Parcours envoyé → validation
    {
      condition: isParcoursEnvoyeStatus,
      tile: {
        title: "Valider mon parcours et financement",
        link: ROUTES.VALIDATE_TRAINING,
      },
    },

    // DF reçu à valider → validation
    {
      condition: canValidateFeasibility,
      tile: {
        title: "Valider mon dossier de faisabilité",
        link: ROUTES.VALIDATE_FEASIBILITY,
      },
    },

    // DF validé sans attestation
    {
      condition: needsSwornAttestationStatement,
      tile: {
        title: "Envoyer votre attestation",
        action: openSendSwornStatementModal,
      },
    },

    // Attente date prévisionnelle :
    {
      condition:
        feasibilityDecision === "ADMISSIBLE" &&
        !candidacy.readyForJuryEstimatedAt &&
        (canSubmitAgainAfterJury || !dossierValidationDecision),
      tile: {
        title:
          "Renseigner une date prévisionnelle de dépot de dossier de validation",
        link: ROUTES.DOSSIER_DE_VALIDATION,
      },
    },

    // DF admissible → DV à envoyer
    {
      condition:
        feasibilityDecision === "ADMISSIBLE" &&
        (!dossierValidationDecision ||
          dossierValidationDecision === "INCOMPLETE" ||
          canSubmitAgainAfterJury),
      tile: {
        title: "Envoyer mon dossier de validation",
        link: ROUTES.DOSSIER_DE_VALIDATION,
      },
    },
  ];

  return rules.filter((r) => r.condition).map((r) => r.tile);
};
export const NextActionTiles = ({
  candidacy,
}: {
  candidacy: CandidacyUseCandidateForDashboard;
}) => {
  const nextActionTiles: NextActionTile[] = getNextActionTiles({
    candidacy,
    openSendSwornStatementModal: sendSwornStatementModal.open,
  });

  const hasNextActionTiles = nextActionTiles.length > 0;
  const router = useRouter();

  return (
    <TileGroup icon="fr-icon-notification-3-line" title="Prochaines étapes">
      {hasNextActionTiles ? (
        nextActionTiles.map((tile) => (
          <Tile
            key={tile.title}
            title={tile.title}
            small
            orientation="horizontal"
            classes={{
              content: "pb-0",
            }}
            buttonProps={{
              onClick: tile.action || (() => router.push(tile.link || "")),
            }}
          />
        ))
      ) : (
        <NoActionTile />
      )}
      <SendSwornStatementModal />
    </TileGroup>
  );
};
