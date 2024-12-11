import Button from "@codegouvfr/react-dsfr/Button";
import { addMonths, format } from "date-fns";
import Image from "next/image";
import Link from "next/link";

export const ActualisationWarning = ({
  lastActivityDate,
}: {
  lastActivityDate: number;
}) => {
  // La candidature sera considérée comme caduque après cette date, 6 mois après la dernière actualisation
  const thresholdDate = format(addMonths(lastActivityDate, 6), "dd/MM/yyyy");

  return (
    <div
      className="mt-12 flex flex-col gap-4"
      data-test="actualisation-warning"
    >
      <div className="static w-full border-b-[4px] border-b-[#FFA180] px-8 py-8 shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)] flex flex-col items-center text-start lg:relative lg:h-[85px] lg:flex-row">
        <Image
          src="/candidat/images/image-home-character-young-man-glasses.png"
          width={132}
          height={153}
          alt="Homme portant des lunettes"
          className="relative hidden -top-28 lg:block lg:top-0 lg:-left-9"
        />
        <div className="flex flex-col justify-center px-4 text-justify lg:mt-0 lg:p-0">
          <p className="my-0">
            <strong>
              Actualisez-vous dès maintenant pour que votre recevabilité reste
              valable !
            </strong>{" "}
            Sans actualisation de votre part d'ici le {thresholdDate}, vous ne
            pourrez plus continuer votre parcours.
          </p>
        </div>
      </div>
      <Link href="/actualisation" className="self-end">
        <Button data-test="actualisation-warning-button">S'actualiser</Button>
      </Link>
    </div>
  );
};
