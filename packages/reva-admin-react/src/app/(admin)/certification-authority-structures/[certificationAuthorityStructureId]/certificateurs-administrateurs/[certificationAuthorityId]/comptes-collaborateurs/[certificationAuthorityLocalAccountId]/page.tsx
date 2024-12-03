"use client";

import { useParams } from "next/navigation";
import { useComptesCollaborateursPage } from "./comptesCollaborateurs.hooks";
import { CertificationAuthorityStructureBreadcrumb } from "../../../../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";
import Input from "@codegouvfr/react-dsfr/Input";
import { CertificationsSummaryCard } from "../../../../_components/certifications-summary-card/CertificationsSummaryCard";
import InterventionAreaSummaryCard from "../../../../_components/intervention-area-summary-card/InterventionAreaSummaryCard";

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

  const regionsAndDepartments: {
    id: string;
    label: string;
    departments: { id: string; label: string; code: string }[];
  }[] = [];
  certificationAuthorityLocalAccount?.departments.forEach((department) => {
    let region = regionsAndDepartments.find(
      (r) => r.id === department.region.id,
    );
    if (!region) {
      region = {
        id: department.region.id,
        label: department.region.label,
        departments: [],
      };
      regionsAndDepartments.push(region);
    }
    region.departments.push(department);
  });

  return (
    <div className="flex flex-col flex-1">
      {certificationAuthorityLocalAccount && (
        <div className="flex flex-col">
          <CertificationAuthorityStructureBreadcrumb
            certificationAuthorityStructureId={
              certificationAuthorityStructureId
            }
            certificationAuthorityStructureLabel={
              certificationAuthorityLocalAccount.certificationAuthority.certificationAuthorityStructures.find(
                (s) => s.id === certificationAuthorityStructureId,
              )?.label || "inconnu"
            }
            certificationAuthorityId={
              certificationAuthorityLocalAccount.certificationAuthority.id
            }
            certificationAuthoritylabel={
              certificationAuthorityLocalAccount.certificationAuthority.label
            }
            pageLabel={"Comptes collaborateurs"}
          />
          <h1>
            {certificationAuthorityLocalAccount.account.firstname}{" "}
            {certificationAuthorityLocalAccount.account.lastname}
          </h1>
          <p className="text-xl mb-12">
            Il s’occupe des candidatures (dossier de validation, jury...)
          </p>
          <div className="flex flex-col gap-12">
            <div>
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
                      certificationAuthorityLocalAccount.account.firstname ||
                      "",
                  }}
                />
                <Input
                  disabled
                  label="Email"
                  nativeInputProps={{
                    value:
                      certificationAuthorityLocalAccount.account.email || "",
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
            <InterventionAreaSummaryCard regions={regionsAndDepartments} />

            <CertificationsSummaryCard
              certifications={certificationAuthorityLocalAccount.certifications}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationAuthorityStructureComptesCollaborateursPage;
