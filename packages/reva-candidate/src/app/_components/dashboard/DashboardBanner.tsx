import Image from "next/image";
import { addDays, format, isAfter, isBefore } from "date-fns";
import { CandidacyUseCandidateForDashboard } from "./dashboard.hooks";
import {
  ACTUALISATION_THRESHOLD_DAYS,
  CADUQUITE_THRESHOLD_DAYS,
} from "../banner-thresholds";
import { isDropOutConfirmed } from "@/utils/dropOutHelper";
import Button from "@codegouvfr/react-dsfr/Button";

export const DashboardBanner = ({
  candidacy,
  candidacyAlreadySubmitted,
  canSubmitCandidacy,
}: {
  candidacy: CandidacyUseCandidateForDashboard;
  candidacyAlreadySubmitted: boolean;
  canSubmitCandidacy: boolean;
}) => {
  let todayIsAfterActualisationBannerThresholdDate: boolean = false;
  if (candidacy?.lastActivityDate) {
    const actualisationBannerThresholdDate = addDays(
      candidacy.lastActivityDate,
      ACTUALISATION_THRESHOLD_DAYS,
    );
    todayIsAfterActualisationBannerThresholdDate = isAfter(
      new Date(),
      actualisationBannerThresholdDate,
    );
  }

  const candidacyContestationsCaducite =
    candidacy?.candidacyContestationsCaducite;
  const lastActiveStatus = candidacy?.status;
  const isLastActiveStatusValidForActualisationBanner =
    lastActiveStatus === "DOSSIER_FAISABILITE_RECEVABLE" ||
    lastActiveStatus === "DOSSIER_DE_VALIDATION_SIGNALE" ||
    lastActiveStatus === "DEMANDE_FINANCEMENT_ENVOYE" ||
    (lastActiveStatus === "DEMANDE_PAIEMENT_ENVOYEE" &&
      candidacy?.activeDossierDeValidation?.decision === "INCOMPLETE");

  const candidacyIsCaduque = !!candidacy?.isCaduque;
  const displayActualisationBanner = !!(
    candidacy?.lastActivityDate &&
    !candidacyIsCaduque &&
    candidacy?.feasibility?.decision === "ADMISSIBLE" &&
    todayIsAfterActualisationBannerThresholdDate &&
    isLastActiveStatusValidForActualisationBanner
  );

  const displayCaduqueBanner = candidacyIsCaduque;

  const pendingContestationCaducite = candidacyContestationsCaducite?.find(
    (contestation) =>
      contestation?.certificationAuthorityContestationDecision ===
      "DECISION_PENDING",
  );
  const hasPendingContestationCaducite = !!pendingContestationCaducite;

  const displayContestationCaduciteHasBeenSent =
    candidacyIsCaduque && hasPendingContestationCaducite;

  const hasConfirmedCaducite = !!candidacyContestationsCaducite?.some(
    (contestation) =>
      contestation?.certificationAuthorityContestationDecision ===
      "CADUCITE_CONFIRMED",
  );
  const displayContestationCaduciteConfirmed =
    candidacyIsCaduque && hasConfirmedCaducite;

  let bannerContent = (
    <div data-test="need-to-complete-info-banner">
      Pour envoyer votre candidature, vous devez avoir complété, vos
      informations dans <b>“Mon profil”</b> et toutes les catégories de la
      section <b>“Compléter ma candidature”</b>.
    </div>
  );
  let imageComponent = (
    <Image
      src="/candidat/images/image-home-character-young-man-glasses.png"
      width={167}
      height={168}
      alt="Homme portant des lunettes"
      className="relative -top-28 lg:top-0 lg:-left-3"
    />
  );
  let actionRequiredCTA = null;

  if (candidacy?.candidacyDropOut) {
    const dropOutConfirmed = isDropOutConfirmed({
      dropOutConfirmedByCandidate:
        candidacy.candidacyDropOut.dropOutConfirmedByCandidate,
      proofReceivedByAdmin: candidacy.candidacyDropOut.proofReceivedByAdmin,
      dropOutDate: new Date(candidacy.candidacyDropOut.createdAt),
    });
    imageComponent = (
      <Image
        src="/candidat/images/fvae_warning.png"
        width={167}
        height={168}
        alt="main levée devant un panneau d'interdiction"
        className="relative -top-28 lg:top-0 lg:-left-3"
      />
    );
    bannerContent = (
      <div data-test="drop-out-warning">
        Votre parcours est en abandon depuis le{" "}
        {format(new Date(candidacy.candidacyDropOut.createdAt), "dd/MM/yyyy")}.{" "}
        {dropOutConfirmed
          ? "Cela fait suite soit à la décision de votre accompagnateur (que vous avez confirmée) soit à un délai d'inactivité de plus de 6 mois."
          : "Vous avez 6 mois pour enregistrer votre décision : accepter l’abandon ou continuer votre parcours."}
      </div>
    );
    actionRequiredCTA = !dropOutConfirmed && (
      <Button
        data-test="drop-out-warning-decision-button"
        linkProps={{
          href: "/candidacy-dropout-decision",
        }}
      >
        Enregistrer ma décision
      </Button>
    );
  } else if (displayContestationCaduciteConfirmed) {
    bannerContent = (
      <div
        data-test="contestation-caducite-confirmed-banner"
        className="lg:-ml-4"
      >
        Après étude de votre contestation, le certificateur a décidé que votre
        recevabilité n'était plus valable. Cela signifie que votre parcours VAE
        s'arrête ici.
      </div>
    );
    imageComponent = (
      <Image
        src="/candidat/images/image-warning-hand.png"
        width={167}
        height={168}
        alt="Main levée en signe d'avertissement"
        className="relative -top-28 lg:top-0 lg:-left-7"
      />
    );
  } else if (displayContestationCaduciteHasBeenSent) {
    bannerContent = (
      <div
        data-test="pending-contestation-caducite-banner"
        className="lg:-ml-4"
      >
        Votre contestation a été faite le{" "}
        {format(
          pendingContestationCaducite?.contestationSentAt as number,
          "dd/MM/yyyy",
        )}
        . Elle a été envoyée à votre certificateur qui y répondra dans les
        meilleurs délais.
      </div>
    );
    imageComponent = (
      <Image
        src="/candidat/images/image-warning-hand.png"
        width={167}
        height={168}
        alt="Main levée en signe d'avertissement"
        className="relative -top-28 lg:top-0 lg:-left-7"
      />
    );
  } else if (displayCaduqueBanner) {
    bannerContent = (
      <div data-test="caduque-banner" className="lg:-ml-4">
        Parce que vous ne vous êtes pas actualisé à temps, votre recevabilité
        n'est plus valable. Cela signifie que votre parcours VAE s'arrête ici.
        Si vous souhaitez contester cette décision, cliquez sur le bouton
        “Contester”.
      </div>
    );
    imageComponent = (
      <Image
        src="/candidat/images/image-warning-hand.png"
        width={167}
        height={168}
        alt="Main levée en signe d'avertissement"
        className="relative -top-28 lg:top-0 lg:-left-7"
      />
    );
    actionRequiredCTA = (
      <Button
        data-test="caduque-banner-button"
        linkProps={{
          href: "/contestation",
        }}
      >
        Contester
      </Button>
    );
  } else if (displayActualisationBanner) {
    // La candidature sera considérée comme caduque après cette date, 6 mois après la dernière actualisation
    const thresholdDate = format(
      addDays(candidacy?.lastActivityDate as number, CADUQUITE_THRESHOLD_DAYS),
      "dd/MM/yyyy",
    );
    bannerContent = (
      <div data-test="actualisation-banner" className="lg:-ml-4">
        <strong>
          Actualisez-vous dès maintenant pour que votre recevabilité reste
          valable !
        </strong>{" "}
        Sans actualisation de votre part d'ici le {thresholdDate}, vous ne
        pourrez plus continuer votre parcours.
      </div>
    );

    imageComponent = (
      <Image
        src="/candidat/images/image-hourglass.png"
        width={167}
        height={168}
        alt="Sablier"
        className="relative -top-28 lg:top-0 lg:-left-7"
      />
    );

    actionRequiredCTA = (
      <Button
        data-test="actualisation-banner-button"
        linkProps={{
          href: "/actualisation",
        }}
      >
        S'actualiser
      </Button>
    );
  } else if (candidacy.activeDossierDeValidation?.decision === "PENDING") {
    bannerContent = (
      <div data-test="pending-dv-banner">
        Votre dossier de validation a bien été envoyé au certificateur. Vous
        recevrez prochainement une convocation pour votre passage devant le jury
        par mail ou par courrier. En cas d’erreur ou d’oubli, contactez-le pour
        pouvoir le modifier dans les plus brefs délais.
      </div>
    );
  } else if (candidacy.activeDossierDeValidation?.decision === "INCOMPLETE") {
    bannerContent = (
      <div data-test="incomplete-dv-banner">
        Le certificateur a signalé que votre dossier de validation comportait
        des erreurs. Rendez vous dans votre section “Dossier de validation” pour
        connaitre les raisons transmises par votre certificateur et transmettre
        un nouveau dossier de validation.
      </div>
    );
  } else if (
    candidacy.feasibility?.decision === "ADMISSIBLE" &&
    candidacy.typeAccompagnement === "AUTONOME"
  ) {
    bannerContent = (
      <div data-test="autonome-admissible-feasibility-banner">
        Félicitations, vous êtes recevable ! Vous pouvez, débuter la rédaction
        de votre dossier de validation.{" "}
        {!candidacy.readyForJuryEstimatedAt && (
          <>
            Afin de simplifier l’organisation de votre jury, vous pouvez
            renseigner une date prévisionnelle de dépôt dans la section “Dossier
            de validation”.
          </>
        )}
      </div>
    );
  } else if (
    candidacy.feasibility?.decision === "ADMISSIBLE" &&
    candidacy.typeAccompagnement === "ACCOMPAGNE"
  ) {
    bannerContent = (
      <div data-test="accompagne-admissible-feasibility-banner">
        Félicitations, votre dossier de faisabilité est recevable ! Votre
        accompagnateur vous contactera prochainement pour démarrer votre
        accompagnement. Vous pourrez, ensemble, débuter la rédaction de votre
        dossier de validation.
      </div>
    );
  } else if (
    candidacy.feasibility?.decision === "DRAFT" &&
    candidacy.typeAccompagnement === "ACCOMPAGNE"
  ) {
    bannerContent = (
      <div data-test="draft-feasibility-banner">
        Votre dossier de faisabilité est désormais consultable ! Si le contenu
        proposé vous convient, transmettez une attestation sur l’honneur signée
        à votre accompagnateur pour valider le dossier de faisabilité.
      </div>
    );
  } else if (
    candidacy.feasibility?.decision === "PENDING" &&
    candidacy.typeAccompagnement === "ACCOMPAGNE"
  ) {
    bannerContent = (
      <div data-test="pending-feasibility-banner">
        Votre dossier a été envoyé au certificateur. Votre accompagnateur et
        vous-même recevrez un e-mail et/ou un courrier dans un délai de 2 mois
        maximum vous informant si vous êtes recevable pour commencer un parcours
        VAE !
      </div>
    );
  } else if (
    candidacy.feasibility?.decision === "PENDING" &&
    candidacy.typeAccompagnement === "AUTONOME"
  ) {
    bannerContent = (
      <div data-test="autonome-pending-feasibility-banner">
        Votre dossier a été envoyé au certificateur. Vous recevrez un e-mail
        et/ou un courrier dans un délai de 2 mois maximum vous informant si vous
        êtes recevable pour commencer un parcours VAE !
      </div>
    );
  } else if (
    candidacy.feasibility?.decision === "INCOMPLETE" &&
    candidacy.typeAccompagnement === "ACCOMPAGNE"
  ) {
    bannerContent = (
      <div data-test="incomplete-feasibility-banner">
        Votre dossier de faisabilité est incomplet. Cliquez sur “Dossier de
        faisabilité” pour découvrir les éléments manquants puis contactez votre
        accompagnateur afin qu’il mette votre dossier à jour.
      </div>
    );
  } else if (
    candidacy.feasibility?.decision === "INCOMPLETE" &&
    candidacy.typeAccompagnement === "AUTONOME"
  ) {
    bannerContent = (
      <div data-test="autonome-incomplete-feasibility-banner">
        Votre dossier de faisabilité est incomplet. Cliquez sur “Dossier de
        faisabilité” pour découvrir les éléments manquants puis soumettez un
        dossier mis à jour.
      </div>
    );
  } else if (candidacy.feasibility?.decision === "REJECTED") {
    imageComponent = (
      <Image
        src="/candidat/images/image-warning-hand.png"
        width={167}
        height={168}
        alt="Main levée en signe d'avertissement"
        className="relative -top-28 lg:top-0 lg:-left-7"
      />
    );
    bannerContent = (
      <div data-test="rejected-feasibility-banner">
        Malheureusement, votre dossier de faisabilité n’a pas été accepté par le
        certificateur. Vous pouvez soit contester cette décision soit arrêter
        votre parcours VAE ici.
      </div>
    );
  } else if (
    candidacyAlreadySubmitted &&
    !candidacy.firstAppointmentOccuredAt &&
    candidacy.typeAccompagnement === "ACCOMPAGNE"
  ) {
    bannerContent = (
      <div data-test="waiting-for-appointment-banner">
        Votre accompagnateur vous enverra prochainement un date de rendez-vous
        pour parler de votre projet. <br /> Si vous n'avez toujours pas eu de
        retour 10 jours après l'envoi de votre candidatures, contactez-le
        directement par mail.
      </div>
    );
  } else if (
    candidacyAlreadySubmitted &&
    !!candidacy.firstAppointmentOccuredAt &&
    isAfter(candidacy.firstAppointmentOccuredAt, new Date())
  ) {
    bannerContent = (
      <div data-test="first-appointment-scheduled-banner">
        <b>Information importante :</b> un rendez-vous est prévu le{" "}
        {format(candidacy.firstAppointmentOccuredAt, "dd/MM/yyyy, à HH'h'mm")}{" "}
        avec{" "}
        <em>{candidacy.organism?.nomPublic || candidacy.organism?.label}</em>.
        Consultez la section “Mes prochains rendez-vous” pour en savoir plus.{" "}
      </div>
    );
  } else if (
    candidacyAlreadySubmitted &&
    !!candidacy.firstAppointmentOccuredAt &&
    isBefore(candidacy.firstAppointmentOccuredAt, new Date()) &&
    candidacy.status === "PARCOURS_CONFIRME"
  ) {
    bannerContent = (
      <div data-test="creating-feasibility-banner">
        Votre accompagnateur est en train de remplir votre dossier de
        faisabilité. Une fois terminé, il vous sera transmis. Vous devrez le
        valider avant qu’il soit envoyé au certificateur pour étude.
      </div>
    );
  } else if (
    candidacyAlreadySubmitted &&
    !!candidacy.firstAppointmentOccuredAt &&
    isBefore(candidacy.firstAppointmentOccuredAt, new Date())
  ) {
    bannerContent = (
      <div data-test="waiting-for-training-banner">
        Votre accompagnateur est en train de construire votre parcours France
        VAE (heures d'accompagnement, formations prévues...).
        <br />
        Vous le découvrirez très prochainement !
      </div>
    );
  } else if (canSubmitCandidacy) {
    bannerContent = (
      <div data-test="can-submit-candidacy-banner">
        Votre candidature est correctement complétée ? Vous pouvez l'envoyer
        sans plus tarder !
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col bg-white lg:flex-row items-center relative text-start border-b-[4px] border-b-[#FFA180] shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)] py-8 px-8 pl-0 w-full mt-32 lg:mt-16 lg:h-[110px]">
        {imageComponent}
        <div className="pt-8 mt-[-120px] lg:mt-0 lg:p-0 text-justify">
          <p className="my-0 pl-8">{bannerContent}</p>
        </div>
      </div>
      {actionRequiredCTA && (
        <div className="self-end mt-2">{actionRequiredCTA}</div>
      )}
    </div>
  );
};
