"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";
import { redirect } from "next/navigation";

import { CertificationStatus } from "@/graphql/generated/graphql";

import { useCertifications } from "./certifications.hooks";

const NoCertifications = () => {
  return (
    <div
      className="grid grid-cols-3 grid-rows-1 w-11/12 mx-auto"
      data-testid="no-certifications"
    >
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

const CertificationsToValidate = ({
  certifications,
}: {
  certifications: {
    id: string;
    label: string;
    codeRncp: string;
  }[];
}) => {
  return (
    <div
      className="grid grid-cols-3 grid-rows-1 w-11/12 mx-auto"
      data-testid="certifications-to-validate"
    >
      <div className="col-span-2 m-auto">
        <h1 className="">
          Bienvenue sur votre espace Responsable des certifications !
        </h1>
        <p className="text-lg">
          Vous pouvez dès à présent compléter et valider les certifications
          suivantes :
          <ul className="mt-6">
            {certifications.map((certification) => (
              <li key={certification.id} data-testid={certification.id}>
                RNCP{certification.codeRncp} - {certification.label}
              </li>
            ))}
          </ul>
        </p>
        <p className="text-sm mb-0">
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
  const { certificationPage, getCertificationsQueryStatus } = useCertifications(
    {},
  );
  const {
    certificationPage: certificationToValidatePage,
    getCertificationsQueryStatus: getCertificationsToValidateQueryStatus,
  } = useCertifications({
    status: "A_VALIDER_PAR_CERTIFICATEUR" as CertificationStatus,
  });

  if (
    getCertificationsToValidateQueryStatus === "pending" ||
    getCertificationsQueryStatus === "pending" ||
    !certificationPage ||
    !certificationToValidatePage
  ) {
    return null;
  }

  if (certificationPage?.rows.length === 0) {
    return <NoCertifications />;
  }

  if (certificationToValidatePage?.rows.length > 0) {
    return (
      <CertificationsToValidate
        certifications={certificationToValidatePage.rows}
      />
    );
  }

  return redirect("certifications");
}
