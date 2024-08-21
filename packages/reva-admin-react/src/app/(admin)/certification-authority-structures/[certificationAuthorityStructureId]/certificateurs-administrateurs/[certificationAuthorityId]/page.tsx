"use client";
import { CertificationAuthorityStructureBreadcrumb } from "../../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";
import { useCertificationAuthority } from "./certificationAuthority.hooks";
import Input from "@codegouvfr/react-dsfr/Input";
import { CertificationsSummaryCard } from "../../_components/certifications-summary-card/CertificationsSummaryCard";
import InterventionAreaSummaryCard from "../../_components/intervention-area-summary-card/InterventionAreaSummaryCard";
import AccountsSummaryCard from "./_components/accounts-summary-card/AccountsSummaryCard";

const CertificationAuthorityAdminsPage = () => {
  const { certificationAuthority, getCertificationAuthorityStatus } =
    useCertificationAuthority();

  if (
    !certificationAuthority ||
    getCertificationAuthorityStatus !== "success"
  ) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1">
      <CertificationAuthorityStructureBreadcrumb
        certificationAuthorityStructureId={
          certificationAuthority.certificationAuthorityStructure.id
        }
        certificationAuthorityStructureLabel={
          certificationAuthority.certificationAuthorityStructure.label
        }
        pageLabel={certificationAuthority.label}
      />
      <h1>{certificationAuthority.label}</h1>
      <p className="text-xl">
        Il s’occupe des candidatures (dossier de validation, jury...) et peut
        ajouter des comptes collaborateurs. L’ajout d’un certificateur
        administrateur est obligatoire pour la gestion des candidatures.
      </p>
      <div className="flex flex-col gap-y-6">
        <form>
          <div className="grid grid-cols-2 w-full gap-x-4">
            <Input
              label="Nom de la structure"
              className="col-span-2"
              nativeInputProps={{
                defaultValue: certificationAuthority.label,
              }}
            />
            <Input
              label="Nom du certificateur"
              nativeInputProps={{
                defaultValue: certificationAuthority.contactFullName ?? "",
              }}
            />
            <Input
              label="Email de connexion"
              nativeInputProps={{
                defaultValue: certificationAuthority.contactEmail ?? "",
              }}
            />
          </div>
        </form>
        <InterventionAreaSummaryCard
          regions={certificationAuthority.regions}
          updateButtonHref={`/certification-authorities/${certificationAuthority.id}`}
        />
        <CertificationsSummaryCard
          certifications={certificationAuthority.certifications}
          updateButtonHref={`/certification-authorities/${certificationAuthority.id}`}
        />
        <AccountsSummaryCard accounts={certificationAuthority.certificationAuthorityLocalAccounts} />
      </div>
    </div>
  );
};

export default CertificationAuthorityAdminsPage;
