import Button from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

export const CguAwaitingManagerValidationNotice = ({
  certificationAuthorityManagerFirstname,
  certificationAuthorityManagerLastname,
  setShowCgu,
}: {
  certificationAuthorityManagerFirstname: string;
  certificationAuthorityManagerLastname: string;
  setShowCgu: (showCgu: boolean) => void;
}) => {
  return (
    <div className="flex items-center justify-center gap-28">
      <div>
        <h1>Mise à jour des conditions générales d'utilisation</h1>
        <p>
          Les conditions générales d'utilisations ont été mise à jour. Seul le
          responsable des certifications de votre structure peut actuellement
          les valider.
        </p>
        <p>
          Pour continuer à utiliser votre espace France VAE veuillez vous
          rapprocher de : {certificationAuthorityManagerFirstname}{" "}
          {certificationAuthorityManagerLastname} afin qu'il valide les
          conditions générales d'utilisations en se connectant à son espace.
        </p>
        <p className="text-sm mb-10">
          Une fois les CGU acceptées par votre responsable de certification,
          veuillez vous reconnecter afin d'accéder à votre espace.
        </p>
        <Button onClick={() => setShowCgu(true)} priority="secondary">
          <span>Voir les conditions générales d'utilisation</span>
        </Button>
      </div>
      <Image
        alt="button cross"
        src="/admin2/components/contract-polygon.svg"
        width={282}
        height={319}
      />
    </div>
  );
};
