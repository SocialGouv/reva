"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { useParams, useRouter } from "next/navigation";

import LocalAccountGeneraInformationCard from "@/components/certification-authority/local-account/summary-cards/general-information-card/LocalAccountGeneralInformationSummaryCard";
import { CertificationsSummaryCard } from "@/components/certification-authority/summary-cards/certifications-summary-card/CertificationsSummaryCard";
import InterventionAreaSummaryCard from "@/components/certification-authority/summary-cards/intervention-area-summary-card/InterventionAreaSummaryCard";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { Impersonate } from "@/components/impersonate/Impersonate.component";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { CertificationAuthorityStructureBreadcrumb } from "../../../../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";

import { useComptesCollaborateursPage } from "./comptesCollaborateurs.hooks";

const CertificationAuthorityStructureComptesCollaborateursPage = () => {
  const router = useRouter();

  const { isFeatureActive } = useFeatureflipping();

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
    deleteCertificationAuthorityLocalAccount,
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

  const deleteConfirmationModal = createModal({
    id: "delete-confirmation-modal",
    isOpenedByDefault: false,
  });

  const handleDeleteCertificationAuthorityLocalAccount = async () => {
    try {
      await deleteCertificationAuthorityLocalAccount.mutateAsync(
        certificationAuthorityLocalAccountId,
      );
      successToast("Compte local supprimé");
      router.push(
        `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/`,
      );
    } catch (error) {
      console.error(error);
      graphqlErrorToast(error);
    }
  };

  const candidaciesUrl = isFeatureActive("CERTIFICATEUR_CANDIDACIES_ANNUAIRE")
    ? `/candidacies/annuaire/?page=1&certificationAuthorityLocalAccountId=${certificationAuthorityLocalAccountId}`
    : `/candidacies/feasibilities/?CATEGORY=ALL&page=1&certificationAuthorityLocalAccountId=${certificationAuthorityLocalAccountId}`;

  return (
    <div
      className="flex flex-col flex-1"
      data-testid="update-certification-authority-local-account-page"
    >
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
                  href: candidaciesUrl,
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
          <div className="flex flex-col gap-12">
            <deleteConfirmationModal.Component
              title="Vous allez supprimer ce compte."
              buttons={[
                {
                  children: "Annuler",
                },
                {
                  onClick: handleDeleteCertificationAuthorityLocalAccount,
                  children: "Continuer",
                  nativeButtonProps: {
                    "data-testid":
                      "delete-certification-authority-local-account-confirm-button",
                  },
                },
              ]}
            >
              <p>Cette action est irréversible.</p>
            </deleteConfirmationModal.Component>
            <LocalAccountGeneraInformationCard
              data-testid="local-account-general-information-summary-card"
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
              data-testid="intervention-area-summary-card"
              updateButtonHref={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/comptes-collaborateurs/${certificationAuthorityLocalAccountId}/zone-intervention`}
              regions={regionsAndDepartments}
            />

            <CertificationsSummaryCard
              data-testid="certifications-summary-card"
              updateButtonHref={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/comptes-collaborateurs/${certificationAuthorityLocalAccountId}/certifications`}
              certifications={certificationAuthorityLocalAccount.certifications}
            />
            <Tile
              data-testid="delete-certification-authority-local-account-button"
              title={
                <span>
                  <span className="fr-icon-delete-fill fr-icon--sm mr-2" />
                  Supprimer ce compte local
                </span>
              }
              detail={
                <span>
                  <span className="fr-icon-warning-fill fr-icon--sm mr-2" />
                  La suppression d’un compte local est irréversible.
                </span>
              }
              small
              orientation="horizontal"
              buttonProps={{
                onClick: deleteConfirmationModal.open,
              }}
            />
            <Button
              priority="secondary"
              linkProps={{
                href: `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/`,
              }}
            >
              Retour
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationAuthorityStructureComptesCollaborateursPage;
