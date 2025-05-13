"use client";

import { useParams } from "next/navigation";
import { useComptesCollaborateursPage } from "./comptesCollaborateurs.hooks";
import { CertificationAuthorityStructureBreadcrumb } from "../../../../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";
import Input from "@codegouvfr/react-dsfr/Input";
import { CertificationsSummaryCard } from "@/components/certification-authority/summary-cards/certifications-summary-card/CertificationsSummaryCard";
import InterventionAreaSummaryCard from "@/components/certification-authority/summary-cards/intervention-area-summary-card/InterventionAreaSummaryCard";
import { Impersonate } from "@/components/impersonate";
import Button from "@codegouvfr/react-dsfr/Button";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import LocalAccountGeneraInformationCard from "@/components/certification-authority/local-account/summary-cards/general-information-card/LocalAccountGeneralInformationSummaryCard";
const CertificationAuthorityStructureComptesCollaborateursPage = () => {
  const { isFeatureActive } = useFeatureflipping();

  const parametresCertificateurFeatureActive = isFeatureActive(
    "PARAMETRES_CERTIFICATEUR",
  );
  const {
    certificationAuthorityStructureId,
    certificationAuthorityId,
    certificationAuthorityLocalAccountId,
  } = useParams<{
    certificationAuthorityStructureId: string;
    certificationAuthorityId: string;
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
            pageLabel={
              certificationAuthorityLocalAccount.account.firstname +
              " " +
              certificationAuthorityLocalAccount.account.lastname
            }
          />
          <div className="flex justify-between gap-4 w-full">
            <h1 className="flex-1">
              {certificationAuthorityLocalAccount.account.firstname}{" "}
              {certificationAuthorityLocalAccount.account.lastname}
            </h1>

            <Impersonate
              accountId={certificationAuthorityLocalAccount?.account?.id}
            />

            <div>
              <Button
                priority="secondary"
                linkProps={{
                  href: `/candidacies/feasibilities/?CATEGORY=ALL&page=1&certificationAuthorityLocalAccountId=${certificationAuthorityLocalAccount.id}`,
                  target: "_blank",
                }}
              >
                Voir les candidatures
              </Button>
            </div>
          </div>

          <p className="text-xl mb-12">
            Il s’occupe des candidatures (dossier de validation, jury...)
          </p>
          {parametresCertificateurFeatureActive ? (
            <div className="flex flex-col gap-12">
              <LocalAccountGeneraInformationCard
                updateGeneralInformationPageUrl={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/comptes-collaborateurs/${certificationAuthorityLocalAccountId}/informations-generales`}
                contactFullName={
                  certificationAuthorityLocalAccount.contactFullName
                }
                contactEmail={certificationAuthorityLocalAccount.contactEmail}
                status={
                  certificationAuthorityLocalAccount.contactEmail
                    ? "COMPLETED"
                    : "TO_COMPLETE"
                }
              />
              <InterventionAreaSummaryCard
                updateButtonHref={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/comptes-collaborateurs/${certificationAuthorityLocalAccountId}/zone-intervention`}
                regions={regionsAndDepartments}
              />

              <CertificationsSummaryCard
                updateButtonHref={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/comptes-collaborateurs/${certificationAuthorityLocalAccountId}/certifications`}
                certifications={
                  certificationAuthorityLocalAccount.certifications
                }
              />
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              <div>
                <h2>Informations de connexion</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <Input
                    disabled
                    label="Nom"
                    nativeInputProps={{
                      value:
                        certificationAuthorityLocalAccount.account.lastname ||
                        "",
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
                        certificationAuthorityLocalAccount
                          .certificationAuthority.label,
                    }}
                  />
                </div>
              </div>
              <InterventionAreaSummaryCard regions={regionsAndDepartments} />

              <CertificationsSummaryCard
                certifications={
                  certificationAuthorityLocalAccount.certifications
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificationAuthorityStructureComptesCollaborateursPage;
