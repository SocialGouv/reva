import { format, isAfter, isBefore } from "date-fns";
import { CandidacyUseCandidateForDashboard } from "./dashboard.hooks";

export const DashboardBanner = ({
  candidacy,
  candidacyAlreadySubmitted,
  canSubmitCandidacy,
}: {
  candidacy: CandidacyUseCandidateForDashboard;
  candidacyAlreadySubmitted: boolean;
  canSubmitCandidacy: boolean;
}) => {
  if (candidacyAlreadySubmitted && !candidacy.firstAppointmentOccuredAt) {
    return (
      <>
        Votre accompagnateur vous enverra prochainement un date de rendez-vous
        pour parler de votre projet. <br /> Si vous n'avez toujours pas eu de
        retour 10 jours après l'envoi de votre candidatures, contactez-le
        directement par mail.
      </>
    );
  } else if (
    candidacyAlreadySubmitted &&
    !!candidacy.firstAppointmentOccuredAt &&
    isAfter(candidacy.firstAppointmentOccuredAt, new Date())
  ) {
    return (
      <>
        <b>Information importante :</b> un rendez-vous est prévu le{" "}
        {format(candidacy.firstAppointmentOccuredAt, "dd/MM/yyyy, à HH'h'mm")}{" "}
        avec{" "}
        <em>{candidacy.organism?.nomPublic || candidacy.organism?.label}</em>.
        Consultez la section “Mes prochains rendez-vous” pour en savoir plus.{" "}
      </>
    );
  } else if (
    candidacyAlreadySubmitted &&
    !!candidacy.firstAppointmentOccuredAt &&
    isBefore(candidacy.firstAppointmentOccuredAt, new Date())
  ) {
    return (
      <>
        Votre accompagnateur est en train de construire votre parcours France
        VAE (heures d'accompagnement, formations prévues...).
        <br />
        Vous le découvrirez très prochainement !
      </>
    );
  } else if (canSubmitCandidacy) {
    return (
      <>
        Votre candidature est correctement complétée ? Vous pouvez l'envoyer
        sans plus tarder !
      </>
    );
  } else {
    return (
      <>
        Pour envoyer votre candidature, vous devez avoir complété, vos
        informations dans <b>“Mon profil”</b> et toutes les catégories de la
        section <b>“Compléter ma candidature”</b>.
      </>
    );
  }
};
