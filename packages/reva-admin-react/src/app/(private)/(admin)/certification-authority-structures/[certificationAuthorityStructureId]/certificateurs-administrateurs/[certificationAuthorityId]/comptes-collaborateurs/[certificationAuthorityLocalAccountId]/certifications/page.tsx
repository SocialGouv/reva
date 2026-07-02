"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { getAdminCertificationAuthorityLocalAccountBreadcrumbSegments } from "@/components/certification-authority/settings-breadcrumb-segments/adminCertificationAuthorityBreadcrumbSegments";
import { MultiSelectList } from "@/components/multi-select-list/MultiSelectList";
import { SettingsBreadcrumb } from "@/components/settings/settings-breadcrumb/SettingsBreadcrumb";
import { SettingsPageHeader } from "@/components/settings/settings-page-header/SettingsPageHeader";
import { graphqlErrorToast } from "@/components/toast/toast";

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
      <SettingsPageHeader
        breadcrumb={
          <SettingsBreadcrumb
            currentPageLabel="Certifications gérées"
            homeLinkProps={{
              href: `/`,
            }}
            segments={getAdminCertificationAuthorityLocalAccountBreadcrumbSegments(
              {
                certificationAuthorityStructureId,
                certificationAuthorityStructureLabel:
                  certificationAuthorityStructure?.label || "",
                certificationAuthorityId,
                certificationAuthorityLabel:
                  certificationAuthorityLocalAccount?.certificationAuthority
                    ?.label || "",
                certificationAuthorityLocalAccountId,
                certificationAuthorityLocalAccountLabel:
                  certificationAuthorityLocalAccount?.account.firstname +
                  " " +
                  certificationAuthorityLocalAccount?.account.lastname,
              },
            )}
          />
        }
        title="Certifications gérées"
        showOptionalFieldsDisclaimer
        chapo={
          <>
            Cochez les certifications proposées par ce compte local. Vous pouvez
            choisir une ou plusieurs certifications. Vous pourrez ajuster cette
            sélection en tout temps.
          </>
        }
      />
      <MultiSelectList
        pageItems={
          certificationPage?.rows.map((c) => ({
            id: c.id,
            detail: `RNCP ${c.codeRncp}`,
            title: c.label,
            detailsPageUrl: `/certifications/${c.id}`,
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
