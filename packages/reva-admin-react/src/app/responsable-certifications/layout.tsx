import { ReactNode } from "react";
import Image from "next/image";

const attachedCertifications = [];
const certificationsToValidate = [];

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

export default function RegistryManagerLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (attachedCertifications.length === 0) {
    return <NoCertifications />;
  }

  if (certificationsToValidate.length > 0) {
    return <CertificationsToValidate />;
  }

  return <div className="flex flex-col md:flex-row w-full">{children}</div>;
}
