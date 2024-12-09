"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@codegouvfr/react-dsfr/Button";

const NoCertificationsToValidate = () => {
  return (
    <div className="grid grid-cols-3 grid-rows-1 w-11/12 m-auto">
      <div className="col-span-2 m-auto">
        <h1 className="">Aucune certification à valider</h1>
        <p className="text-lg">
          Pour le moment, vous n’avez rien à valider. Si vous avez demandé
          l’ajout d’une ou de plusieurs certifications, elles s’afficheront ici
          très prochainement !
        </p>
      </div>
      <div className="m-auto">
        <Image
          src="/admin2/components/information.svg"
          alt="Success pictogram"
          width={282}
          height={319}
        />
      </div>
    </div>
  );
};

const NoVisibleCertifications = () => {
  return (
    <div className="grid grid-cols-3 grid-rows-1 w-11/12 m-auto">
      <div className="col-span-2 m-auto">
        <h1 className="">Aucune certification visible</h1>
        <p className="text-lg mb-0">
          Pour être visible, la certification doit être validée par vos soins et
          active sur France compétences.
        </p>
        <Button
          linkProps={{
            href: "/responsable-certifications/certifications?CATEGORY=TO_VALIDATE",
          }}
          priority="tertiary"
          className="mt-10"
        >
          Voir les certifications à valider
        </Button>
      </div>
      <div className="m-auto">
        <Image
          src="/admin2/components/warning.svg"
          alt="Success pictogram"
          width={282}
          height={319}
        />
      </div>
    </div>
  );
};

const NoInisibleCertifications = () => {
  return (
    <div className="grid grid-cols-3 grid-rows-1 w-11/12 m-auto">
      <div className="col-span-2 m-auto">
        <h1 className="">Aucune certification invisible</h1>
        <p className="text-lg mb-0">
          Retrouvez ici les certifications qui ne sont pas ou plus visibles sur
          la plateforme France VAE.
        </p>
      </div>
      <div className="m-auto">
        <Image
          src="/admin2/components/information.svg"
          alt="Success pictogram"
          width={282}
          height={319}
        />
      </div>
    </div>
  );
};

export default function RegistryManagerHomepage() {
  const searchParams = useSearchParams();
  const currentPathname = usePathname();
  const page = searchParams.get("page");
  const category = searchParams.get("CATEGORY");

  const { replace } = useRouter();

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("CATEGORY", category || "TO_VALIDATE");
    params.set("page", page || "1");

    if (!page || !category) {
      replace(`${currentPathname}?${params.toString()}`);
    }
  }, [replace, page, category, currentPathname]);

  if (category === "TO_VALIDATE") {
    return <NoCertificationsToValidate />;
  }

  if (category === "VISIBLE") {
    return <NoVisibleCertifications />;
  }

  if (category === "INVISIBLE") {
    return <NoInisibleCertifications />;
  }

  return <div>liste</div>;
}
