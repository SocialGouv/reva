import { isDropOutConfirmed } from "@/utils/dropOutHelper";
import Button from "@codegouvfr/react-dsfr/Button";
import { addDays, format, isAfter, isBefore } from "date-fns";
import Image from "next/image";
import {
  ACTUALISATION_THRESHOLD_DAYS,
  CADUQUITE_THRESHOLD_DAYS,
} from "../banner-thresholds";
import { CandidacyUseCandidateForDashboard } from "./dashboard.hooks";

type BannerConfig = {
  content: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  testId: string;
  actionButton?: React.ReactNode;
};

type BannerProps = {
  candidacy: CandidacyUseCandidateForDashboard;
  candidacyAlreadySubmitted: boolean;
  canSubmitCandidacy: boolean;
};

const DEFAULT_IMAGE =
  "/candidat/images/image-home-character-young-man-glasses.png";
const DEFAULT_ALT = "Homme portant des lunettes";

const BannerImage = ({ src, alt }: { src: string; alt: string }) => (
  <div className="min-w-[167px] hidden lg:flex relative -left-3">
    <Image src={src} width={167} height={168} alt={alt} />
  </div>
);

const ActionButton = ({
  href,
  label,
  testId,
}: {
  href: string;
  label: string;
  testId?: string;
}) => (
  <Button
    data-test={testId}
    linkProps={{
      href,
    }}
  >
    {label}
  </Button>
);

const getBannerConfig = ({
  candidacy,
  candidacyAlreadySubmitted,
  canSubmitCandidacy,
}: BannerProps): BannerConfig => {
  const {
    firstAppointmentOccuredAt,
    organism,
    status,
    typeAccompagnement,
    feasibility,
    lastActivityDate,
    isCaduque,
    activeDossierDeValidation,
    candidacyContestationsCaducite,
    candidacyDropOut,
    readyForJuryEstimatedAt,
  } = candidacy;

  let todayIsAfterActualisationBannerThresholdDate = false;

  if (lastActivityDate) {
    const actualisationBannerThresholdDate = addDays(
      lastActivityDate,
      ACTUALISATION_THRESHOLD_DAYS,
    );
    todayIsAfterActualisationBannerThresholdDate = isAfter(
      new Date(),
      actualisationBannerThresholdDate,
    );
  }

  const lastActiveStatus = status;
  const isLastActiveStatusValidForActualisationBanner =
    lastActiveStatus === "DOSSIER_FAISABILITE_RECEVABLE" ||
    lastActiveStatus === "DOSSIER_DE_VALIDATION_SIGNALE" ||
    lastActiveStatus === "DEMANDE_FINANCEMENT_ENVOYE" ||
    (lastActiveStatus === "DEMANDE_PAIEMENT_ENVOYEE" &&
      activeDossierDeValidation?.decision === "INCOMPLETE");

  const candidacyIsCaduque = !!isCaduque;
  const displayActualisationBanner = !!(
    lastActivityDate &&
    !candidacyIsCaduque &&
    feasibility?.decision === "ADMISSIBLE" &&
    todayIsAfterActualisationBannerThresholdDate &&
    isLastActiveStatusValidForActualisationBanner
  );

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

  let config: BannerConfig = {
    content: (
      <div data-test="need-to-complete-info-banner">
        Pour envoyer votre candidature, vous devez avoir complété, vos
        informations dans <b>"Mon profil"</b> et toutes les catégories de la
        section <b>"Compléter ma candidature"</b>.
      </div>
    ),
    imageSrc: DEFAULT_IMAGE,
    imageAlt: DEFAULT_ALT,
    testId: "need-to-complete-info-banner",
  };

  if (candidacyDropOut) {
    const dropOutConfirmed = isDropOutConfirmed({
      dropOutConfirmedByCandidate: candidacyDropOut.dropOutConfirmedByCandidate,
      proofReceivedByAdmin: candidacyDropOut.proofReceivedByAdmin,
      dropOutDate: new Date(candidacyDropOut.createdAt),
    });

    config = {
      content: (
        <div data-test="drop-out-warning">
          Votre parcours est en abandon depuis le{" "}
          {format(new Date(candidacyDropOut.createdAt), "dd/MM/yyyy")}.{" "}
          {dropOutConfirmed
            ? "Cela fait suite soit à la décision de votre accompagnateur (que vous avez confirmée) soit à un délai d'inactivité de plus de 6 mois."
            : "Vous avez 6 mois pour enregistrer votre décision : accepter l'abandon ou continuer votre parcours."}
        </div>
      ),
      imageSrc: "/candidat/images/fvae_warning.png",
      imageAlt: "main levée devant un panneau d'interdiction",
      testId: "drop-out-warning",
    };

    if (!dropOutConfirmed) {
      config.actionButton = (
        <ActionButton
          href="/candidacy-dropout-decision"
          label="Enregistrer ma décision"
          testId="drop-out-warning-decision-button"
        />
      );
    }

    return config;
  }

  if (displayContestationCaduciteConfirmed) {
    return {
      content: (
        <div data-test="contestation-caducite-confirmed-banner">
          Après étude de votre contestation, le certificateur a décidé que votre
          recevabilité n'était plus valable. Cela signifie que votre parcours
          VAE s'arrête ici.
        </div>
      ),
      imageSrc: "/candidat/images/image-warning-hand.png",
      imageAlt: "Main levée en signe d'avertissement",
      testId: "contestation-caducite-confirmed-banner",
    };
  }

  if (displayContestationCaduciteHasBeenSent) {
    return {
      content: (
        <div data-test="pending-contestation-caducite-banner">
          Votre contestation a été faite le{" "}
          {format(
            pendingContestationCaducite?.contestationSentAt as number,
            "dd/MM/yyyy",
          )}
          . Elle a été envoyée à votre certificateur qui y répondra dans les
          meilleurs délais.
        </div>
      ),
      imageSrc: "/candidat/images/image-warning-hand.png",
      imageAlt: "Main levée en signe d'avertissement",
      testId: "pending-contestation-caducite-banner",
    };
  }

  if (candidacyIsCaduque) {
    return {
      content: (
        <div data-test="caduque-banner">
          Parce que vous ne vous êtes pas actualisé à temps, votre recevabilité
          n'est plus valable. Cela signifie que votre parcours VAE s'arrête ici.
          Si vous souhaitez contester cette décision, cliquez sur le bouton
          "Contester".
        </div>
      ),
      imageSrc: "/candidat/images/image-warning-hand.png",
      imageAlt: "Main levée en signe d'avertissement",
      actionButton: (
        <ActionButton
          href="/contestation"
          label="Contester"
          testId="caduque-banner-button"
        />
      ),
      testId: "caduque-banner",
    };
  }

  if (displayActualisationBanner) {
    const thresholdDate = format(
      addDays(lastActivityDate as number, CADUQUITE_THRESHOLD_DAYS),
      "dd/MM/yyyy",
    );

    return {
      content: (
        <div data-test="actualisation-banner">
          <strong>
            Actualisez-vous dès maintenant pour que votre recevabilité reste
            valable !
          </strong>{" "}
          Sans actualisation de votre part d'ici le {thresholdDate}, vous ne
          pourrez plus continuer votre parcours.
        </div>
      ),
      imageSrc: "/candidat/images/image-hourglass.png",
      imageAlt: "Sablier",
      actionButton: (
        <ActionButton
          href="/actualisation"
          label="S'actualiser"
          testId="actualisation-banner-button"
        />
      ),
      testId: "actualisation-banner",
    };
  }

  if (activeDossierDeValidation?.decision === "PENDING") {
    return {
      imageSrc: DEFAULT_IMAGE,
      imageAlt: DEFAULT_ALT,
      content: (
        <div data-test="pending-dv-banner">
          Votre dossier de validation a bien été envoyé au certificateur. Vous
          recevrez prochainement une convocation pour votre passage devant le
          jury par mail ou par courrier. En cas d'erreur ou d'oubli,
          contactez-le pour pouvoir le modifier dans les plus brefs délais.
        </div>
      ),
      testId: "pending-dv-banner",
    };
  }

  if (activeDossierDeValidation?.decision === "INCOMPLETE") {
    return {
      imageSrc: DEFAULT_IMAGE,
      imageAlt: DEFAULT_ALT,
      content: (
        <div data-test="incomplete-dv-banner">
          Le certificateur a signalé que votre dossier de validation comportait
          des erreurs. Rendez vous dans votre section "Dossier de validation"
          pour connaitre les raisons transmises par votre certificateur et
          transmettre un nouveau dossier de validation.
        </div>
      ),
      testId: "incomplete-dv-banner",
    };
  }

  if (
    feasibility?.decision === "ADMISSIBLE" &&
    typeAccompagnement === "AUTONOME"
  ) {
    return {
      imageSrc: DEFAULT_IMAGE,
      imageAlt: DEFAULT_ALT,
      content: (
        <div data-test="autonome-admissible-feasibility-banner">
          Félicitations, vous êtes recevable ! Vous pouvez, débuter la rédaction
          de votre dossier de validation.{" "}
          {!readyForJuryEstimatedAt && (
            <>
              Afin de simplifier l'organisation de votre jury, vous pouvez
              renseigner une date prévisionnelle de dépôt dans la section
              "Dossier de validation".
            </>
          )}
        </div>
      ),
      testId: "autonome-admissible-feasibility-banner",
    };
  }

  if (
    feasibility?.decision === "ADMISSIBLE" &&
    typeAccompagnement === "ACCOMPAGNE"
  ) {
    return {
      imageSrc: DEFAULT_IMAGE,
      imageAlt: DEFAULT_ALT,
      content: (
        <div data-test="accompagne-admissible-feasibility-banner">
          Félicitations, votre dossier de faisabilité est recevable ! Votre
          accompagnateur vous contactera prochainement pour démarrer votre
          accompagnement. Vous pourrez, ensemble, débuter la rédaction de votre
          dossier de validation.
        </div>
      ),
      testId: "accompagne-admissible-feasibility-banner",
    };
  }

  if (
    feasibility?.decision === "DRAFT" &&
    typeAccompagnement === "ACCOMPAGNE"
  ) {
    return {
      imageSrc: DEFAULT_IMAGE,
      imageAlt: DEFAULT_ALT,
      content: (
        <div data-test="draft-feasibility-banner">
          Votre dossier de faisabilité est désormais consultable ! Si le contenu
          proposé vous convient, transmettez une attestation sur l'honneur
          signée à votre accompagnateur pour valider le dossier de faisabilité.
        </div>
      ),
      testId: "draft-feasibility-banner",
    };
  }

  if (feasibility?.decision === "PENDING") {
    const isPendingAccompagne = typeAccompagnement === "ACCOMPAGNE";
    return {
      imageSrc: DEFAULT_IMAGE,
      imageAlt: DEFAULT_ALT,
      content: (
        <div
          data-test={
            isPendingAccompagne
              ? "pending-feasibility-banner"
              : "autonome-pending-feasibility-banner"
          }
        >
          Votre dossier a été envoyé au certificateur.{" "}
          {isPendingAccompagne ? "Votre accompagnateur et vous-même" : "Vous"}{" "}
          recevrez un e-mail et/ou un courrier dans un délai de 2 mois maximum
          vous informant si vous êtes recevable pour commencer un parcours VAE !
        </div>
      ),
      testId: isPendingAccompagne
        ? "pending-feasibility-banner"
        : "autonome-pending-feasibility-banner",
    };
  }

  if (feasibility?.decision === "INCOMPLETE") {
    const isAccompagne = typeAccompagnement === "ACCOMPAGNE";
    return {
      imageSrc: DEFAULT_IMAGE,
      imageAlt: DEFAULT_ALT,
      content: (
        <div
          data-test={
            isAccompagne
              ? "incomplete-feasibility-banner"
              : "autonome-incomplete-feasibility-banner"
          }
        >
          Votre dossier de faisabilité est incomplet. Cliquez sur "Dossier de
          faisabilité" pour découvrir les éléments manquants puis
          {isAccompagne
            ? " contactez votre accompagnateur afin qu'il mette votre dossier à jour."
            : " soumettez un dossier mis à jour."}
        </div>
      ),
      testId: isAccompagne
        ? "incomplete-feasibility-banner"
        : "autonome-incomplete-feasibility-banner",
    };
  }

  if (feasibility?.decision === "REJECTED") {
    return {
      content: (
        <div data-test="rejected-feasibility-banner">
          Malheureusement, votre dossier de faisabilité n'a pas été accepté par
          le certificateur. Vous pouvez soit contester cette décision soit
          arrêter votre parcours VAE ici.
        </div>
      ),
      imageSrc: "/candidat/images/image-warning-hand.png",
      imageAlt: "Main levée en signe d'avertissement",
      testId: "rejected-feasibility-banner",
    };
  }

  if (
    candidacyAlreadySubmitted &&
    !firstAppointmentOccuredAt &&
    typeAccompagnement === "ACCOMPAGNE"
  ) {
    return {
      imageSrc: DEFAULT_IMAGE,
      imageAlt: DEFAULT_ALT,
      content: (
        <div data-test="waiting-for-appointment-banner">
          Votre accompagnateur vous enverra prochainement un date de rendez-vous
          pour parler de votre projet. <br /> Si vous n'avez toujours pas eu de
          retour 10 jours après l'envoi de votre candidatures, contactez-le
          directement par mail.
        </div>
      ),
      testId: "waiting-for-appointment-banner",
    };
  }

  if (candidacyAlreadySubmitted && !!firstAppointmentOccuredAt) {
    if (isAfter(firstAppointmentOccuredAt, new Date())) {
      return {
        imageSrc: DEFAULT_IMAGE,
        imageAlt: DEFAULT_ALT,
        content: (
          <div data-test="first-appointment-scheduled-banner">
            <b>Information importante :</b> un rendez-vous est prévu le{" "}
            {format(firstAppointmentOccuredAt, "dd/MM/yyyy, à HH'h'mm")} avec{" "}
            <em>{organism?.nomPublic || organism?.label}</em>. Consultez la
            section "Mes prochains rendez-vous" pour en savoir plus.{" "}
          </div>
        ),
        testId: "first-appointment-scheduled-banner",
      };
    }

    if (
      isBefore(firstAppointmentOccuredAt, new Date()) &&
      status === "PARCOURS_CONFIRME"
    ) {
      return {
        imageSrc: DEFAULT_IMAGE,
        imageAlt: DEFAULT_ALT,
        content: (
          <div data-test="creating-feasibility-banner">
            Votre accompagnateur est en train de remplir votre dossier de
            faisabilité. Une fois terminé, il vous sera transmis. Vous devrez le
            valider avant qu'il soit envoyé au certificateur pour étude.
          </div>
        ),
        testId: "creating-feasibility-banner",
      };
    }

    if (isBefore(firstAppointmentOccuredAt, new Date())) {
      return {
        imageSrc: DEFAULT_IMAGE,
        imageAlt: DEFAULT_ALT,
        content: (
          <div data-test="waiting-for-training-banner">
            Votre accompagnateur est en train de construire votre parcours
            France VAE (heures d'accompagnement, formations prévues...).
            <br />
            Vous le découvrirez très prochainement !
          </div>
        ),
        testId: "waiting-for-training-banner",
      };
    }
  }

  if (canSubmitCandidacy) {
    return {
      imageSrc: DEFAULT_IMAGE,
      imageAlt: DEFAULT_ALT,
      content: (
        <div data-test="can-submit-candidacy-banner">
          Votre candidature est correctement complétée ? Vous pouvez l'envoyer
          sans plus tarder !
        </div>
      ),
      testId: "can-submit-candidacy-banner",
    };
  }

  return {
    content: (
      <div data-test="need-to-complete-info-banner">
        Pour envoyer votre candidature, vous devez avoir complété, vos
        informations dans <b>"Mon profil"</b> et toutes les catégories de la
        section <b>"Compléter ma candidature"</b>.
      </div>
    ),
    imageSrc: DEFAULT_IMAGE,
    imageAlt: DEFAULT_ALT,
    testId: "need-to-complete-info-banner",
  };
};

export const DashboardBanner = ({
  candidacy,
  candidacyAlreadySubmitted,
  canSubmitCandidacy,
}: BannerProps) => {
  if (!candidacy) {
    return null;
  }

  const bannerConfig = getBannerConfig({
    candidacy,
    candidacyAlreadySubmitted,
    canSubmitCandidacy,
  });

  return (
    <div className="flex flex-col">
      <div className="flex bg-white items-center border-b-[4px] border-b-[#FFA180] shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)] py-8 px-8 lg:ml-3 lg:pl-0 mt-32 lg:mt-16 lg:h-[110px]">
        <BannerImage src={bannerConfig.imageSrc} alt={bannerConfig.imageAlt} />
        <p className="my-0 lg:ml-4 text-justify">{bannerConfig.content}</p>
      </div>
      {bannerConfig.actionButton && (
        <div className="self-end mt-2">{bannerConfig.actionButton}</div>
      )}
    </div>
  );
};
