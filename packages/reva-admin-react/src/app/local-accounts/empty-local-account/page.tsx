"use client";

import { useRouter } from "next/navigation";

import Button from "@codegouvfr/react-dsfr/Button";

import { useCertificationAuthorityQueries } from "../certificationAuthorityQueries";

const EmptyLocalAccountPage = (): JSX.Element => {
  const { certifictionAuthority } = useCertificationAuthorityQueries();

  const router = useRouter();

  return (
    <div className="w-full flex flex-col pl-32 pr-32 pt-12 pb-12">
      <h3 className="text-3xl font-bold mb-8">
        Comptes locaux - {certifictionAuthority?.label}
      </h3>

      <h4 className="text-2xl font-bold mb-8">
        Gérez ici les comptes locaux de vos collaborateurs ou équipes
      </h4>

      <p className="mb-8">
        Dans cet espace, vous pouvez ajouter de nouveaux comptes, leur assigner
        une zone géographique ainsi qu’une liste de certifications précises.
      </p>

      <p className="mb-8">
        Ces comptes peuvent être nominatifs ou génériques (partagés).
      </p>

      <div className="flex flex-col md:flex-row gap-4 self-center mt-8 md:mt-0">
        <Button
          onClick={() => {
            router.push("/local-accounts/add-local-account");
          }}
        >
          Ajouter des nouveaux comptes
        </Button>
      </div>
    </div>
  );
};

export default EmptyLocalAccountPage;
