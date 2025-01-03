import Button from "@codegouvfr/react-dsfr/Button";
import { addDays, format } from "date-fns";
import Link from "next/link";
import { Banner } from "./Banner";
import { CADUQUITE_THRESHOLD_DAYS } from "./banner-thresholds";

export const ActualisationBanner = ({
  lastActivityDate,
}: {
  lastActivityDate: number | undefined | null;
}) => {
  // La candidature sera considérée comme caduque après cette date, 6 mois après la dernière actualisation
  const thresholdDate = format(
    addDays(lastActivityDate as number, CADUQUITE_THRESHOLD_DAYS),
    "dd/MM/yyyy",
  );

  return (
    <div className="mt-12 flex flex-col gap-4" data-test="actualisation-banner">
      <Banner
        description={
          <>
            <strong>
              Actualisez-vous dès maintenant pour que votre recevabilité reste
              valable !
            </strong>{" "}
            Sans actualisation de votre part d'ici le {thresholdDate}, vous ne
            pourrez plus continuer votre parcours.
          </>
        }
        imageSrc="/candidat/images/image-hourglass.png"
        imgAlt="Homme portant des lunettes"
      />
      <Link href="/actualisation" className="self-end">
        <Button data-test="actualisation-banner-button">S'actualiser</Button>
      </Link>
    </div>
  );
};
