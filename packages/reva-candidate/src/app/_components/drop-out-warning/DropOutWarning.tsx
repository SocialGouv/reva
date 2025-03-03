import { format } from "date-fns";
import fvaeWarning from "./assets/fvae_warning.png";
import Image from "next/image";
import Button from "@codegouvfr/react-dsfr/Button";

export const DropOutWarning = ({
  dropOutDate,
  className,
  onDecisionButtonClick,
  dropOutConfirmed,
}: {
  dropOutDate: Date;
  className?: string;
  onDecisionButtonClick?: () => void;
  dropOutConfirmed?: boolean;
}) => (
  <div
    data-test="drop-out-warning"
    className={`flex flex-col ${className || ""}`}
  >
    <div className="flex flex-col gap-4 md:gap-0 md:flex-row items-center min-h-[160px]">
      <Image
        className="z-10"
        alt="main levée devant un panneau d'interdiction"
        style={{
          width: "132px",
          height: "154px",
        }}
        src={fvaeWarning}
      />
      <div className="md:-ml-16 p-6 md:pl-24 border-b-4 border-fvae-hard-red shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
        Votre parcours est en abandon depuis le{" "}
        {format(dropOutDate, "dd/MM/yyyy")}.{" "}
        {dropOutConfirmed
          ? "Cela fait suite soit à la décision de votre accompagnateur (que vous avez confirmée) soit à un délai d'inactivité de plus de 6 mois."
          : "Vous avez 6 mois pour enregistrer votre décision : accepter l’abandon ou continuer votre parcours."}
      </div>
    </div>
    {!dropOutConfirmed && (
      <Button
        data-test="drop-out-warning-decision-button"
        className="ml-auto -mt-3"
        onClick={onDecisionButtonClick}
      >
        Enregistrer ma décision
      </Button>
    )}
  </div>
);
