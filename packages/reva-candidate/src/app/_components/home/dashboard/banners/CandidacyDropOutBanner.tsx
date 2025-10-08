import { format, toDate } from "date-fns";

import { isDropOutConfirmed } from "@/utils/dropOutHelper";

import { CandidacyDropOutUseCandidateForDashboard } from "../dashboard.hooks";

import { BaseBanner } from "./BaseBanner";

const WARNING_IMAGE = "/candidat/images/fvae_warning.png";
const WARNING_IMAGE_ALT = "main levée devant un panneau d'interdiction";

interface CandidacyDropOutBannerProps {
  candidacyDropOut: NonNullable<CandidacyDropOutUseCandidateForDashboard>;
}
export const CandidacyDropOutBanner = ({
  candidacyDropOut,
}: CandidacyDropOutBannerProps) => {
  const dropOutConfirmed = isDropOutConfirmed({
    dropOutConfirmedByCandidate: candidacyDropOut.dropOutConfirmedByCandidate,
    proofReceivedByAdmin: candidacyDropOut.proofReceivedByAdmin,
    dropOutDate: toDate(candidacyDropOut.createdAt),
  });

  const content = (
    <div data-test="drop-out-warning">
      Votre parcours est en abandon depuis le{" "}
      {format(toDate(candidacyDropOut.createdAt), "dd/MM/yyyy")}.{" "}
      {dropOutConfirmed
        ? "Cela fait suite soit à la décision de votre accompagnateur (que vous avez confirmée) soit à un délai d'inactivité de plus de 6 mois."
        : "Vous avez 6 mois pour enregistrer votre décision : accepter l'abandon ou continuer votre parcours."}
    </div>
  );

  let actionButton;
  if (!dropOutConfirmed) {
    actionButton = {
      href: "./candidacy-dropout-decision",
      label: "Enregistrer ma décision",
      testId: "drop-out-warning-decision-button",
    };
  }

  return (
    <BaseBanner
      content={content}
      imageSrc={WARNING_IMAGE}
      imageAlt={WARNING_IMAGE_ALT}
      actionButton={actionButton}
    />
  );
};
