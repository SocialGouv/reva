import { format } from "date-fns";
import fvaeWarning from "./assets/fvae_warning.png";
import Image from "next/image";

export const DropOutAlert = ({
  dropOutDate,
  className,
}: {
  dropOutDate: Date;
  className?: string;
}) => (
  <div
    className={`flex flex-col gap-4 md:gap-0 md:flex-row items-center min-h-[160px] ${className || ""}`}
  >
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
      Votre accompagnateur a déclaré l’abandon de votre parcours VAE le{" "}
      {format(dropOutDate, "dd/MM/yyyy")}. Vous avez 6 mois pour enregistrer
      votre décision : accepter l’abandon ou continuer votre parcours.
    </div>
  </div>
);
