import { format, isAfter, isBefore } from "date-fns";
import { OrganismUseCandidateForDashboard } from "../dashboard.hooks";
import { BaseBanner } from "./BaseBanner";

interface AppointmentsBannerProps {
  candidacyAlreadySubmitted: boolean;
  firstAppointmentOccuredAt?: number | null;
  organism?: OrganismUseCandidateForDashboard;
  status: string;
}

export const AppointmentsBanner = ({
  candidacyAlreadySubmitted,
  firstAppointmentOccuredAt,
  organism,
  status,
}: AppointmentsBannerProps) => {
  if (!candidacyAlreadySubmitted) {
    return null;
  }

  // Waiting for first appointment
  if (!firstAppointmentOccuredAt) {
    return (
      <BaseBanner
        content={
          <div data-test="waiting-for-appointment-banner">
            Votre accompagnateur vous enverra prochainement un date de
            rendez-vous pour parler de votre projet. <br /> Si vous n'avez
            toujours pas eu de retour 10 jours après l'envoi de votre
            candidatures, contactez-le directement par mail.
          </div>
        }
      />
    );
  }

  // Future appointment
  if (isAfter(firstAppointmentOccuredAt, new Date())) {
    return (
      <BaseBanner
        content={
          <div data-test="first-appointment-scheduled-banner">
            <b>Information importante :</b> un rendez-vous est prévu le{" "}
            {format(firstAppointmentOccuredAt, "dd/MM/yyyy, à HH'h'mm")} avec{" "}
            <em>{organism?.nomPublic || organism?.label}</em>. Consultez la
            section "Mes prochains rendez-vous" pour en savoir plus.{" "}
          </div>
        }
      />
    );
  }

  // Past appointment with confirmed path
  if (
    isBefore(firstAppointmentOccuredAt, new Date()) &&
    status === "PARCOURS_CONFIRME"
  ) {
    return (
      <BaseBanner
        content={
          <div data-test="creating-feasibility-banner">
            Votre accompagnateur est en train de remplir votre dossier de
            faisabilité. Une fois terminé, il vous sera transmis. Vous devrez le
            valider avant qu'il soit envoyé au certificateur pour étude.
          </div>
        }
      />
    );
  }

  // Past appointment, waiting for training plan
  if (isBefore(firstAppointmentOccuredAt, new Date())) {
    return (
      <BaseBanner
        content={
          <div data-test="waiting-for-training-banner">
            Votre accompagnateur est en train de construire votre parcours
            France VAE (heures d'accompagnement, formations prévues...).
            <br />
            Vous le découvrirez très prochainement !
          </div>
        }
      />
    );
  }

  return null;
};
