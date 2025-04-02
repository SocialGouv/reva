import { format } from "date-fns";
import { CandidacyContestationsCaduciteUseCandidateForDashboard } from "../dashboard.hooks";
import { BaseBanner } from "./BaseBanner";

const WARNING_IMAGE = "/candidat/images/image-warning-hand.png";
const WARNING_IMAGE_ALT = "Main levée en signe d'avertissement";

interface CandidacyCaduciteBannerProps {
  candidacyContestationsCaducite: CandidacyContestationsCaduciteUseCandidateForDashboard;
}

export const CandidacyCaduciteBanner = ({
  candidacyContestationsCaducite,
}: CandidacyCaduciteBannerProps) => {
  const pendingContestationCaducite = candidacyContestationsCaducite?.find(
    (contestation) =>
      contestation?.certificationAuthorityContestationDecision ===
      "DECISION_PENDING",
  );
  const hasPendingContestationCaducite = !!pendingContestationCaducite;

  const hasConfirmedCaducite = candidacyContestationsCaducite?.some(
    (contestation) =>
      contestation?.certificationAuthorityContestationDecision ===
      "CADUCITE_CONFIRMED",
  );

  if (hasConfirmedCaducite) {
    return (
      <BaseBanner
        content={
          <div data-test="contestation-caducite-confirmed-banner">
            Après étude de votre contestation, le certificateur a décidé que
            votre recevabilité n'était plus valable. Cela signifie que votre
            parcours VAE s'arrête ici.
          </div>
        }
        imageSrc={WARNING_IMAGE}
        imageAlt={WARNING_IMAGE_ALT}
      />
    );
  }

  if (hasPendingContestationCaducite) {
    return (
      <BaseBanner
        content={
          <div data-test="pending-contestation-caducite-banner">
            Votre contestation a été faite le{" "}
            {format(
              pendingContestationCaducite?.contestationSentAt as number,
              "dd/MM/yyyy",
            )}
            . Elle a été envoyée à votre certificateur qui y répondra dans les
            meilleurs délais.
          </div>
        }
        imageSrc={WARNING_IMAGE}
        imageAlt={WARNING_IMAGE_ALT}
      />
    );
  }

  return (
    <BaseBanner
      content={
        <div data-test="caduque-banner">
          Parce que vous ne vous êtes pas actualisé à temps, votre recevabilité
          n'est plus valable. Cela signifie que votre parcours VAE s'arrête ici.
          Si vous souhaitez contester cette décision, cliquez sur le bouton
          "Contester".
        </div>
      }
      imageSrc={WARNING_IMAGE}
      imageAlt={WARNING_IMAGE_ALT}
      actionButton={{
        href: "/contestation",
        label: "Contester",
        testId: "caduque-banner-button",
      }}
    />
  );
};
