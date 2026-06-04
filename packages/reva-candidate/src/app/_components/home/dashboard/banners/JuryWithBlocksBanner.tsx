import Badge from "@codegouvfr/react-dsfr/Badge";
import { format, isAfter } from "date-fns";
import Link from "next/link";

import { CustomErrorBadge } from "@/components/legacy/organisms/CustomErrorBadge/CustomErrorBadge";
import warningImage from "@public/images/fvae_warning.png";
import goldCupImage from "@public/images/gold-cup.png";

import { JuryUseCandidateForDashboard } from "../dashboard.hooks";

import { BaseBanner } from "./BaseBanner";

interface JuryWithBlocksBannerProps {
  jury: NonNullable<JuryUseCandidateForDashboard>;
}

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
export const JuryWithBlocksBanner = ({ jury }: JuryWithBlocksBannerProps) => {
  const { dateOfSession, result, isResultTemporary } = jury;
  const isUpcoming = isAfter(dateOfSession, new Date());

  const resultIsSuccess =
    result === "FULL_SUCCESS_OF_FULL_CERTIFICATION" ||
    result === "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION";
  const resultIsPartialSuccess =
    result === "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION" ||
    result === "PARTIAL_SUCCESS_PENDING_CONFIRMATION" ||
    result === "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION";
  const resultIsNotPresent =
    result === "CANDIDATE_ABSENT" || result === "CANDIDATE_EXCUSED";
  const resultIsFailure = result === "FAILURE";

  if (resultIsSuccess) {
    return (
      <BaseBanner
        content={
          <>
            <p className="font-bold mb-0">
              Félicitations, vous avez réussi votre parcours VAE !
            </p>
            <p className="mb-0">
              Consultez les{" "}
              <Link href="./jury-results" className="fr-link">
                détails des résultats de votre jury
              </Link>{" "}
              ou contactez dès à présent votre accompagnateur.
            </p>
          </>
        }
        imageSrc={goldCupImage}
        imageAlt="Une coupe en or"
        topBadge={
          <>
            <Badge data-testid="result-badge" severity="success">
              Réussite
            </Badge>
            {isResultTemporary && <BadgeSubtitle />}
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
              Vous avez obtenu une partie de votre diplôme grâce à la VAE !{" "}
              <span className="font-normal">
                Consultez les{" "}
                <Link href="./jury-results" className="fr-link">
                  détails des résultats de votre jury
                </Link>
                .
              </span>
            </p>
            <p className="mb-0">
              Pour obtenir les blocs manquants, retrouvez toutes les
              informations dans la section “Dossier de validation”.
            </p>
          </>
        }
        topBadge={
          <>
            <Badge data-testid="result-badge" severity="info">
              Réussite partielle
            </Badge>
            {isResultTemporary && <BadgeSubtitle />}
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
              Vous n'avez pas pu être présent lors du passage devant le jury.{" "}
              <span className="font-normal">
                Consultez{" "}
                <Link href="./jury-results" className="fr-link">
                  les détails des résultats de votre jury
                </Link>
                .
              </span>
            </p>
            <p className="mb-0">
              Vous pouvez repasser devant le jury. Retrouvez toutes les
              informations dans la section “Dossier de validation”.
            </p>
          </>
        }
        imageSrc={warningImage}
        imageAlt={WARNING_IMAGE_ALT}
        topBadge={
          <>
            <Badge data-testid="result-badge" severity="new">
              Non présent le jour du jury
            </Badge>
            {isResultTemporary && <BadgeSubtitle />}
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
              Vous n’avez pas obtenu votre diplôme via ce parcours VAE.{" "}
              <span className="font-normal">
                Consultez les{" "}
                <Link href="./jury-results" className="fr-link">
                  détails des résultats de votre jury
                </Link>
                .
              </span>
            </p>
            <p className="mb-0">
              Pour comprendre cette décision, retrouvez toutes les informations
              dans la section “Dossier de validation”.
            </p>
          </>
        }
        imageSrc={warningImage}
        imageAlt={WARNING_IMAGE_ALT}
        topBadge={
          <>
            <CustomErrorBadge
              dataTestId="result-badge"
              label="Diplôme non obtenu"
            />
            {isResultTemporary && <BadgeSubtitle />}
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
            {format(dateOfSession, "dd/MM/yyyy")}. Vous trouverez l’heure et le
            lieu de passage sur votre convocation ou dans l’encart “Mes
            prochains rendez-vous”. Un empêchement ? Contactez votre
            certificateur dès à présent.
          </>
        }
        testId="jury-banner-upcoming"
      />
    );
  }

  return (
    <BaseBanner
      content={
        <>Vous recevrez bientôt le résultat de votre passage devant le jury.</>
      }
      testId="jury-banner-no-result"
    />
  );
};
