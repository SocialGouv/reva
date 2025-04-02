import { CustomErrorBadge } from "@/components/legacy/organisms/CustomErrorBadge/CustomErrorBadge";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { format, isAfter } from "date-fns";
import { JuryUseCandidateForDashboard } from "../dashboard.hooks";
import { BaseBanner } from "./BaseBanner";

interface JuryBannerProps {
  jury: NonNullable<JuryUseCandidateForDashboard>;
}

const WARNING_IMAGE = "/candidat/images/fvae_warning.png";
const WARNING_IMAGE_ALT = "main levée devant un panneau d'interdiction";

const BadgeSubtitle = () => (
  <p className="mb-0 mt-2 text-xs">
    <span
      className="fr-icon-warning-line fr-icon--sm mr-1"
      aria-hidden="true"
    />
    Ce résultat a été renseigné par un administrateur France VAE. Le résultat
    transmis par le certificateur par courrier officiel fait foi.
  </p>
);
export const JuryBanner = ({ jury }: JuryBannerProps) => {
  const { dateOfSession, result } = jury;
  const isUpcoming = isAfter(dateOfSession, new Date());

  const resultIsSuccess =
    result === "FULL_SUCCESS_OF_FULL_CERTIFICATION" ||
    result === "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION";
  const resultIsPartialSuccess =
    result === "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION" ||
    result === "PARTIAL_SUCCESS_PENDING_CONFIRMATION";
  const resultIsNotPresent =
    result === "CANDIDATE_ABSENT" || result === "CANDIDATE_EXCUSED";
  const resultIsFailure = result === "FAILURE";

  if (resultIsSuccess) {
    return (
      <BaseBanner
        content={
          <>
            <p className="font-bold mb-0">
              Félicitations, vous avez obtenu votre diplôme grâce au parcours
              VAE !
            </p>
            <p className="mb-0">
              Pour en savoir plus, contactez dès à présent votre accompagnateur.
            </p>
          </>
        }
        imageSrc="/candidat/images/gold-cup.png"
        imageAlt="Une coupe en or"
        topBadge={
          <>
            <Badge severity="success">Réussite totale</Badge>
            <BadgeSubtitle />
          </>
        }
        testId="jury-banner-success"
      />
    );
  }

  if (resultIsPartialSuccess) {
    return (
      <BaseBanner
        content={
          <>
            <p className="font-bold mb-0">
              Vous avez obtenu une partie de votre diplôme grâce au parcours VAE
              !
            </p>
            <p className="mb-0">
              Suite à ce résultat, vous pouvez repasser devant le jury.
              Retrouvez toutes les informations au niveau de votre dossier de
              validation.
            </p>
          </>
        }
        topBadge={
          <>
            <Badge severity="info">Réussite partielle</Badge>
            <BadgeSubtitle />
          </>
        }
        testId="jury-banner-partial-success"
      />
    );
  }

  if (resultIsNotPresent) {
    return (
      <BaseBanner
        content={
          <>
            <p className="font-bold mb-0">
              Vous n'avez pas pu être présent lors du passage devant le jury.
            </p>
            <p className="mb-0">
              Vous pouvez repasser devant le jury. Retrouvez toutes les
              informations au niveau de votre dossier de validation.
            </p>
          </>
        }
        imageSrc={WARNING_IMAGE}
        imageAlt={WARNING_IMAGE_ALT}
        topBadge={
          <>
            <Badge severity="new">Non présent le jour du jury</Badge>
            <BadgeSubtitle />
          </>
        }
        testId="jury-banner-absent-or-excused"
      />
    );
  }

  if (resultIsFailure) {
    return (
      <BaseBanner
        content={
          <>
            <p className="font-bold mb-0">
              Malheureusement, vous n'avez pas obtenu votre diplôme via ce
              parcours VAE.
            </p>
            <p className="mb-0">
              Suite à ce résultat, vous pouvez repasser devant le jury.
              Retrouvez toutes les informations au niveau de votre dossier de
              validation.
            </p>
          </>
        }
        imageSrc={WARNING_IMAGE}
        imageAlt={WARNING_IMAGE_ALT}
        topBadge={
          <>
            <CustomErrorBadge label="Diplôme non obtenu" />
            <BadgeSubtitle />
          </>
        }
        testId="jury-banner-failure"
      />
    );
  }

  if (isUpcoming) {
    return (
      <BaseBanner
        content={
          <>
            Le jour-J est programmé ! Votre passage devant le jury aura lieu le{" "}
            {format(dateOfSession, "dd/MM/yyyy")}. Vous trouverez la date,
            l'heure et le lieu de passage sur votre convocation ou dans l'encart
            "Mes prochains rendez-vous". Un empêchement ? Contactez votre
            certificateur dès à présente.
          </>
        }
        testId="jury-banner-upcoming"
      />
    );
  }

  return (
    <BaseBanner
      content={
        <>
          Après votre passage devant le jury, vous recevrez sa décision par
          e-mail sous 15 jours environ. Votre accompagnateur sera lui aussi
          informé de la décision du certificateur.
        </>
      }
      testId="jury-banner-no-result"
    />
  );
};
