import { FeasibilityUseCandidateForDashboard } from "../dashboard.hooks";

import { BaseBanner } from "./BaseBanner";

interface FeasibilityBannerProps {
  feasibility: NonNullable<FeasibilityUseCandidateForDashboard>;
  typeAccompagnement: string;
  readyForJuryEstimatedAt?: string | null;
}

const WARNING_IMAGE = "/candidat/images/image-warning-hand.png";
const WARNING_IMAGE_ALT = "Main levée en signe d'avertissement";

export const FeasibilityBanner = ({
  feasibility,
  typeAccompagnement,
  readyForJuryEstimatedAt,
}: FeasibilityBannerProps) => {
  const { decision } = feasibility;

  if (decision === "ADMISSIBLE") {
    return (
      <BaseBanner
        content={
          <div data-testid="admissible-feasibility-banner">
            {!readyForJuryEstimatedAt ? (
              <>
                Vous êtes recevable ! Vous pouvez débuter la rédaction de votre
                dossier de validation. Afin de simplifier l’organisation de
                votre jury, renseignez la date à laquelle vous pensez avoir
                terminé votre dossier dans la section “Dossier de validation”.
              </>
            ) : (
              <>
                Lorsque vous aurez terminé la rédaction de votre dossier de
                validation, déposez-le dans la section “Dossier de validation”.
              </>
            )}
          </div>
        }
      />
    );
  }

  // Dossier pas encore envoyé au candidat
  if (
    decision === "DRAFT" &&
    typeAccompagnement === "ACCOMPAGNE" &&
    !feasibility.dematerializedFeasibilityFile?.sentToCandidateAt
  ) {
    return (
      <BaseBanner
        content={
          <div data-testid="creating-feasibility-banner">
            Votre accompagnateur est en train de remplir votre dossier de
            faisabilité. Une fois terminé, il vous sera transmis. Vous devrez le
            valider avant qu'il soit envoyé au certificateur.
          </div>
        }
      />
    );
  }

  // Dossier envoyé au candidat, candidat n'ayant pas encore confirmé
  if (
    (decision === "DRAFT" || decision === "INCOMPLETE") &&
    typeAccompagnement === "ACCOMPAGNE" &&
    !feasibility.dematerializedFeasibilityFile?.candidateConfirmationAt &&
    feasibility.dematerializedFeasibilityFile?.sentToCandidateAt
  ) {
    return (
      <BaseBanner
        content={
          <div data-testid="draft-feasibility-banner">
            Votre dossier de faisabilité est désormais consultable ! Vérifiez-le
            puis transmettez une attestation sur l’honneur signée à votre
            accompagnateur pour valider le dossier de faisabilité.
          </div>
        }
      />
    );
  }

  // Candidat ayant confirmé sans attestation
  if (
    (decision === "DRAFT" || decision === "INCOMPLETE") &&
    typeAccompagnement === "ACCOMPAGNE" &&
    feasibility.dematerializedFeasibilityFile?.candidateConfirmationAt &&
    !feasibility.dematerializedFeasibilityFile?.swornStatementFileId
  ) {
    return (
      <BaseBanner
        content={
          <div data-testid="draft-feasibility-no-sworn-statement-banner">
            Vous avez validé votre dossier de faisabilité. Si vous n’avez
            toujours pas transmis votre attestation sur l’honneur, n’oubliez pas
            de l’envoyer à votre accompagnateur.
          </div>
        }
      />
    );
  }

  // Candidat ayant confirmé avec attestation
  if (
    (decision === "DRAFT" || decision === "INCOMPLETE") &&
    typeAccompagnement === "ACCOMPAGNE" &&
    feasibility.dematerializedFeasibilityFile?.candidateConfirmationAt &&
    feasibility.dematerializedFeasibilityFile?.swornStatementFileId
  ) {
    return (
      <BaseBanner
        content={
          <div data-testid="draft-feasibility-with-sworn-statement-banner">
            Vous avez validé votre dossier de faisabilité. Votre accompagnateur
            le transmettra à votre certificateur.
          </div>
        }
      />
    );
  }

  if (decision === "PENDING") {
    const isPendingAccompagne = typeAccompagnement === "ACCOMPAGNE";
    return (
      <BaseBanner
        content={
          <div
            data-testid={
              isPendingAccompagne
                ? "pending-feasibility-banner"
                : "autonome-pending-feasibility-banner"
            }
          >
            Votre dossier a été envoyé au certificateur.{" "}
            {isPendingAccompagne ? "Votre accompagnateur et vous-même" : "Vous"}{" "}
            recevrez bientôt une décision sur votre recevabilité.
          </div>
        }
      />
    );
  }

  if (
    decision === "INCOMPLETE" &&
    !feasibility.dematerializedFeasibilityFile?.candidateConfirmationAt &&
    typeAccompagnement === "ACCOMPAGNE"
  ) {
    return (
      <BaseBanner
        content={
          <div data-testid="incomplete-feasibility-banner">
            Votre dossier de faisabilité est incomplet. Votre accompagnateur est
            en train de le mettre à jour et vous le renverra bientôt pour
            validation.
          </div>
        }
        imageSrc={WARNING_IMAGE}
        imageAlt={WARNING_IMAGE_ALT}
      />
    );
  }

  if (decision === "INCOMPLETE" && typeAccompagnement === "AUTONOME") {
    return (
      <BaseBanner
        content={
          <div data-testid="autonome-incomplete-feasibility-banner">
            Votre certificateur a notifié qu’il manquait des éléments à votre
            dossier de faisabilité. Rendez vous dans la section “Dossier de
            faisabilité” pour connaitre les raisons et transmettre un nouveau
            dossier.
          </div>
        }
        imageSrc={WARNING_IMAGE}
        imageAlt={WARNING_IMAGE_ALT}
      />
    );
  }

  if (decision === "REJECTED") {
    return (
      <BaseBanner
        content={
          <div data-testid="rejected-feasibility-banner">
            Votre dossier de faisabilité n’a pas été validé par le certificateur
            : votre parcours VAE s’arrête ici.
          </div>
        }
        imageSrc={WARNING_IMAGE}
        imageAlt={WARNING_IMAGE_ALT}
      />
    );
  }

  return null;
};
