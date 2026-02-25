"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { MultiSelectList } from "@/components/multi-select-list/MultiSelectList";
import { graphqlErrorToast } from "@/components/toast/toast";

import { AdminCertificationAuthorityLocalAccountBreadcrumb } from "../_components/admin-certification-authority-local-account-breadcrumb/AdminCertificationAuthorityLocalAccountBreadcrumb";

import { useUpdateLocalAccountCertificationsPage } from "./updateLocalAccountCertificationsPage.hook";

export default function InterventionAreaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsPage = searchParams.get("page");
  const currentPage = searchParamsPage ? Number(searchParamsPage) : 1;
  const onlyShowAddedItems = searchParams.get("onlyShowAddedItems") === "true";
  const searchFilter = searchParams.get("searchFilter");

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
    isLoading,
    certificationsFromLocalAccount,
    certificationAuthorityStructure,
    certificationPage,
    updateCertificationAuthorityLocalAccountCertifications,
  } = useUpdateLocalAccountCertificationsPage({
    certificationAuthorityLocalAccountId,
    certificationAuthorityStructureId,
    certificationAuthorityId,
    page: currentPage,
    onlyShowAddedCertifications: onlyShowAddedItems,
    searchFilter,
  });

  const handleEmptyStateShowAllItemsButtonClick = ({
    currentQueryParams,
  }: {
    currentQueryParams: URLSearchParams;
  }) => {
    currentQueryParams.delete("page");
    currentQueryParams.delete("onlyShowAddedItems");
    currentQueryParams.delete("searchFilter");
    router.push(
      `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/comptes-collaborateurs/${certificationAuthorityLocalAccountId}/certifications?${currentQueryParams.toString()}`,
    );
  };

  const handleCertificationSelectionChange = async ({
    itemId,
    selected,
  }: {
    itemId: string;
    selected: boolean;
  }) => {
    try {
      await updateCertificationAuthorityLocalAccountCertifications.mutateAsync(
        selected
          ? [
              ...(certificationsFromLocalAccount?.map((c) => c.id) || []),
              itemId,
            ]
          : certificationsFromLocalAccount
              ?.filter((c) => c.id !== itemId)
              .map((c) => c.id) || [],
      );
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div
      className="flex flex-col h-full"
      data-testid="update-certification-authority-local-account-certifications-page"
    >
      <AdminCertificationAuthorityLocalAccountBreadcrumb
        certificationAuthorityStructureId={certificationAuthorityStructureId}
        certificationAuthorityStructureLabel={
          certificationAuthorityStructure?.label || ""
        }
        certificationAuthorityId={certificationAuthorityId}
        certificationAuthoritylabel={
          certificationAuthorityLocalAccount?.certificationAuthority?.label ||
          ""
        }
        certificationAuthorityLocalAccountId={
          certificationAuthorityLocalAccountId
        }
        certificationAuthorityLocalAccountLabel={
          certificationAuthorityLocalAccount?.account.firstname +
          " " +
          certificationAuthorityLocalAccount?.account.lastname
        }
        pageLabel="Certifications gérées"
      />

      <h1>Certifications gérées</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="mb-12">
        Cochez les certifications proposées par ce compte local. Vous pouvez
        choisir une ou plusieurs certifications. Vous pourrez ajuster cette
        sélection en tout temps.
      </p>
      <MultiSelectList
        pageItems={
          certificationPage?.rows.map((c) => ({
            id: c.id,
            detail: `RNCP ${c.codeRncp}`,
            title: c.label,
            selected: certificationsFromLocalAccount?.some(
              (cl) => cl.id === c.id,
            ),
          })) || []
        }
        paginationInfo={{
          totalItems: certificationPage?.info.totalRows || 0,
          totalPages: certificationPage?.info.totalPages || 1,
        }}
        itemTypeLabelForSearchResultsCount="certification(s)"
        onlyShowAddedItemsSwitchLabel="Afficher les certifications ajoutées uniquement"
        searchBarLabel="Rechercher par code RNCP, intitulé de certification etc..."
        emptyStateTitle="Aucune certification trouvée"
        onSelectionChange={handleCertificationSelectionChange}
        onEmptyStateShowAllItemsButtonClick={
          handleEmptyStateShowAllItemsButtonClick
        }
      />
    </div>
  );
}
