"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { useParams } from "next/navigation";

import { getCertificationAuthorityStructureBreadcrumbSegments } from "@/components/certification-authority/settings-breadcrumb-segments/adminCertificationAuthorityBreadcrumbSegments";
import { CertificationAuthorityLocalAccountsSummaryCard } from "@/components/certification-authority/summary-cards/certification-authority-local-accounts-summary-card/CertificationAuthorityLocalAccountsSummaryCard";
import { CertificationsSummaryCard } from "@/components/certification-authority/summary-cards/certifications-summary-card/CertificationsSummaryCard";
import GeneralInformationCard from "@/components/certification-authority/summary-cards/general-information-card/GeneralInformationCard";
import InterventionAreaSummaryCard from "@/components/certification-authority/summary-cards/intervention-area-summary-card/InterventionAreaSummaryCard";
import { Impersonate } from "@/components/impersonate/Impersonate.component";
import { SettingsBreadcrumb } from "@/components/settings/settings-breadcrumb/SettingsBreadcrumb";
import { SettingsPageHeader } from "@/components/settings/settings-page-header/SettingsPageHeader";

import { useCertificationAuthority } from "./certificationAuthority.hooks";

const CertificationAuthorityAdminComponent = ({
  certificationAuthority,
  certificationAuthorityStructureId,
}: {
  certificationAuthority: NonNullable<
    ReturnType<typeof useCertificationAuthority>["certificationAuthority"]
  >;
  certificationAuthorityStructureId: string;
}) => {
  const regionsAndDepartments: {
    id: string;
    label: string;
    departments: { id: string; label: string; code: string }[];
  }[] = [];
  certificationAuthority?.departments.forEach((department) => {
    if (department.region) {
      let region = regionsAndDepartments.find(
        (r) => r.id === department.region?.id,
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
    }
  });

  const candidaciesUrl = `/candidacies/annuaire/?page=1&certificationAuthorityId=${certificationAuthority.id}`;

  return (
    <div
      className="flex flex-col flex-1 min-w-0"
      data-testid="certification-authority-admin-page"
    >
      <SettingsPageHeader
        breadcrumb={
          <SettingsBreadcrumb
            currentPageLabel={certificationAuthority.label}
            homeLinkProps={{
              href: `/`,
            }}
            segments={getCertificationAuthorityStructureBreadcrumbSegments({
              certificationAuthorityStructureId,
              certificationAuthorityStructureLabel:
                certificationAuthority.certificationAuthorityStructures.find(
                  (s) => s.id === certificationAuthorityStructureId,
                )?.label || "inconnu",
            })}
          />
        }
        title={certificationAuthority.label}
        actions={
          <>
            <Impersonate accountId={certificationAuthority?.account?.id} />
            <div>
              <Button
                priority="secondary"
                linkProps={{
                  href: candidaciesUrl,
                  target: "_blank",
                }}
              >
                Voir les candidatures
              </Button>
            </div>
          </>
        }
        chapo={
          <>
            Il s’occupe des candidatures (dossier de validation, jury...) et
            peut ajouter des comptes collaborateurs. L’ajout d’un certificateur
            administrateur est obligatoire pour la gestion des candidatures.
          </>
        }
      />
      <div className="flex flex-col gap-y-6">
        <GeneralInformationCard
          hrefPrefix={`/certification-authority-structures/${certificationAuthority.certificationAuthorityStructures[0].id}/certificateurs-administrateurs/${certificationAuthority.id}`}
          certificationAuthority={certificationAuthority}
        />
        <InterventionAreaSummaryCard
          regions={regionsAndDepartments}
          updateButtonHref={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthority.id}/zone-intervention`}
        />
        <CertificationsSummaryCard
          certifications={certificationAuthority.certifications}
          updateButtonHref={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthority.id}/certifications`}
        />
        <CertificationAuthorityLocalAccountsSummaryCard
          accounts={certificationAuthority.certificationAuthorityLocalAccounts}
          addLocalAccountPageUrl={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthority.id}/comptes-collaborateurs/ajouter`}
          updateLocalAccountPageUrl={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthority.id}/comptes-collaborateurs/`}
        />
      </div>
      <div className="flex flex-row justify-end mt-4 gap-x-4">
        <Button
          className="mr-auto"
          priority="secondary"
          linkProps={{
            href: `/certification-authority-structures/${certificationAuthorityStructureId}`,
          }}
        >
          Retour
        </Button>
      </div>
    </div>
  );
};

const CertificationAuthorityAdminPage = () => {
  const { certificationAuthority, getCertificationAuthorityStatus } =
    useCertificationAuthority();

  const { certificationAuthorityStructureId } = useParams<{
    certificationAuthorityStructureId: string;
  }>();

  if (
    !certificationAuthority ||
    getCertificationAuthorityStatus !== "success"
  ) {
    return null;
  }

  return (
    <CertificationAuthorityAdminComponent
      certificationAuthority={certificationAuthority}
      certificationAuthorityStructureId={certificationAuthorityStructureId}
    />
  );
};

export default CertificationAuthorityAdminPage;
