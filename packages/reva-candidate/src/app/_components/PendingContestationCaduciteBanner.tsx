import { format } from "date-fns";
import { Banner } from "./Banner";

export const PendingContestationCaduciteBanner = ({
  pendingContestationCaduciteSentAt,
}: {
  pendingContestationCaduciteSentAt: number | undefined;
}) => (
  <div className="my-14" data-test="pending-contestation-caducite-banner">
    <Banner
      imageSrc="/candidat/images/image-warning-hand.png"
      imgAlt="Main levée en signe d'avertissement"
      description={
        <>
          Votre contestation a été faite le{" "}
          {format(pendingContestationCaduciteSentAt as number, "dd/MM/yyyy")}.
          Elle a été envoyée à votre certificateur qui y répondra dans les
          meilleurs délais.
        </>
      }
    />
  </div>
);
