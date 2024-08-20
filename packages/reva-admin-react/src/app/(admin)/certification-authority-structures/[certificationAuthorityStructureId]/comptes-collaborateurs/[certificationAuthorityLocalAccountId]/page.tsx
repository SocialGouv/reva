"use client";

import { useParams } from "next/navigation";
import { useComptesCollaborateursPage } from "./comptesCollaborateurs.hooks";
import { CertificationAuthorityStructureBreadcrumb } from "../../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";
import Input from "@codegouvfr/react-dsfr/Input";

const CertificationAuthorityStructureComptesCollaborateursPage = () => {
  const {
    certificationAuthorityStructureId,
    certificationAuthorityLocalAccountId,
  } = useParams<{
    certificationAuthorityStructureId: string;
    certificationAuthorityLocalAccountId: string;
  }>();

  const {
    certificationAuthorityLocalAccount,
    getCertificationAuthorityLocalAccountStatus,
  } = useComptesCollaborateursPage({ certificationAuthorityLocalAccountId });

  if (getCertificationAuthorityLocalAccountStatus !== "success") {
    return null;
  }

  return (
    <div className="flex flex-col flex-1">
      {certificationAuthorityLocalAccount && (
        <div className="flex flex-col">
          <CertificationAuthorityStructureBreadcrumb
            certificationAuthorityStructureId={
              certificationAuthorityStructureId
            }
            certificationAuthorityStructureLabel={
              certificationAuthorityLocalAccount.certificationAuthority
                .certificationAuthorityStructure.label
            }
            pageLabel={"Comptes collaborateurs"}
          />
          <h1>
            {certificationAuthorityLocalAccount.account.firstname}{" "}
            {certificationAuthorityLocalAccount.account.lastname}
          </h1>
          <p className="text-xl">
            Il s’occupe des candidatures (dossier de validation, jury...)
          </p>
          <h2>Informations de connexion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Input
              disabled
              label="Nom"
              nativeInputProps={{
                value:
                  certificationAuthorityLocalAccount.account.lastname || "",
              }}
            />
            <Input
              disabled
              label="Prénom"
              nativeInputProps={{
                value:
                  certificationAuthorityLocalAccount.account.firstname || "",
              }}
            />
            <Input
              disabled
              label="Email"
              nativeInputProps={{
                value:
                  certificationAuthorityLocalAccount.account.firstname || "",
              }}
            />
            <Input
              disabled
              label="Libellé"
              className="col-span-2"
              nativeInputProps={{
                value:
                  certificationAuthorityLocalAccount.certificationAuthority
                    .label,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationAuthorityStructureComptesCollaborateursPage;
