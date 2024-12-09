// import { ReactNode } from "react";
import Image from "next/image";
import Button from "@codegouvfr/react-dsfr/Button";
import { redirect } from "next/navigation";

const attachedCertifications = [1];
const certificationsToValidate = [1];

const NoCertifications = () => {
  return (
    <div className="grid grid-cols-3 grid-rows-1 w-11/12 mx-auto">
      <div className="col-span-2 m-auto">
        <h1 className="">
          Bienvenue sur votre espace Responsable des certifications !
        </h1>
        <p className="text-lg">
          C’est ici que vous pourrez compléter, modifier et valider les
          certifications.
        </p>
        <p className="text-sm">
          Si vous avez d’ores et déjà demandé à France VAE d’ajouter une ou
          plusieurs certifications, vous les retrouverez ici très prochainement.
        </p>
      </div>
      <div className="m-auto">
        <Image
          src="/admin2/components/success.svg"
          alt="Success pictogram"
          width={282}
          height={319}
        />
      </div>
    </div>
  );
};

const CertificationsToValidate = () => {
  return (
    <div className="grid grid-cols-3 grid-rows-1 w-11/12 mx-auto">
      <div className="col-span-2 m-auto">
        <h1 className="">
          Bienvenue sur votre espace Responsable des certifications !
        </h1>
        <p className="text-lg">
          Vous pouvez dès à présent compléter et valider les certifications
          suivantes :
          <ul>
            <li>Certif 1</li>
            <li>Certif 2</li>
          </ul>
        </p>
        <p className="text-sm">
          Vous avez demandé à France VAE d’ajouter d’autres certifications ?
          Retrouvez-les dans votre espace très prochainement !
        </p>
        <Button linkProps={{ href: "certifications" }} className="mt-10">
          Voir les certifications à valider
        </Button>
      </div>
      <div className="m-auto">
        <Image
          src="/admin2/components/success.svg"
          alt="Success pictogram"
          width={282}
          height={319}
        />
      </div>
    </div>
  );
};

export default function RegistryManagerHomepage() {
  if (attachedCertifications.length === 0) {
    return <NoCertifications />;
  }

  if (certificationsToValidate.length > 0) {
    return <CertificationsToValidate />;
  }

  return redirect("certifications");
}
