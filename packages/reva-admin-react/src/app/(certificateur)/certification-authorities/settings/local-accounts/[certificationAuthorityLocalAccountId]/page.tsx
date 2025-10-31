"use client";

import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal/Modal";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

import LocalAccountGeneralInformationSummaryCard from "@/components/certification-authority/local-account/summary-cards/general-information-card/LocalAccountGeneralInformationSummaryCard";
import { CertificationsSummaryCard } from "@/components/certification-authority/summary-cards/certifications-summary-card/CertificationsSummaryCard";
import InterventionAreaSummaryCard from "@/components/certification-authority/summary-cards/intervention-area-summary-card/InterventionAreaSummaryCard";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { useUpdateLocalAccountPage } from "./updateLocalAccountPage.hook";

export default function UpdateLocalAccountPage() {
  const router = useRouter();

  const { certificationAuthorityLocalAccountId } = useParams<{
    certificationAuthorityLocalAccountId: string;
  }>();

  const {
    certificationAuthorityLocalAccount,
    deleteCertificationAuthorityLocalAccount,
  } = useUpdateLocalAccountPage({
    certificationAuthorityLocalAccountId: certificationAuthorityLocalAccountId,
  });

  const deleteConfirmationModal = createModal({
    id: "delete-confirmation-modal",
    isOpenedByDefault: false,
  });

  const localAccountLabel = `${certificationAuthorityLocalAccount?.account.firstname} ${certificationAuthorityLocalAccount?.account.lastname}`;

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

  const handleDeleteCertificationAuthorityLocalAccount = async () => {
    try {
      await deleteCertificationAuthorityLocalAccount.mutateAsync(
        certificationAuthorityLocalAccountId,
      );
      successToast("Compte local supprimé");
      router.push("/certification-authorities/settings/");
    } catch (error) {
      console.error(error);
      graphqlErrorToast(error);
    }
  };

  return (
    <div
      className="flex flex-col"
      data-testid="update-certification-authority-local-account-page"
    >
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
      <Breadcrumb
        segments={[
          {
            label: "Paramètres",
            linkProps: { href: "/certification-authorities/settings/" },
          },
        ]}
        currentPageLabel={localAccountLabel}
      />
      <h1>{localAccountLabel}</h1>
      <p className="mb-12">
        Retrouvez l’ensemble des informations liées à ce compte local.
      </p>
      <Button
        className="ml-auto mb-4"
        priority="tertiary no outline"
        iconId="ri-inbox-2-fill"
        linkProps={{
          href: `/candidacies/feasibilities/?CATEGORY=ALL&page=1&certificationAuthorityLocalAccountId=${certificationAuthorityLocalAccount?.id}`,
          target: "_blank",
          className: "after:content-none",
        }}
      >
        Voir les candidatures
      </Button>
      <div className="w-full flex flex-col gap-8">
        <LocalAccountGeneralInformationSummaryCard
          contactFullName={certificationAuthorityLocalAccount?.contactFullName}
          contactEmail={certificationAuthorityLocalAccount?.contactEmail}
          updateGeneralInformationPageUrl={`/certification-authorities/settings/local-accounts/${certificationAuthorityLocalAccountId}/general-information`}
        />
        <InterventionAreaSummaryCard
          regions={regionsAndDepartments}
          updateButtonHref={`/certification-authorities/settings/local-accounts/${certificationAuthorityLocalAccountId}/intervention-area`}
        />
        <CertificationsSummaryCard
          certifications={
            certificationAuthorityLocalAccount?.certifications || []
          }
          updateButtonHref={`/certification-authorities/settings/local-accounts/${certificationAuthorityLocalAccountId}/certifications`}
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
      </div>
      <Button
        className="mt-12"
        priority="secondary"
        linkProps={{
          href: "/certification-authorities/settings/",
        }}
      >
        Retour
      </Button>
    </div>
  );
}
