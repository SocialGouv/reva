"use client";

import Badge from "@codegouvfr/react-dsfr/Badge";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { getAdminCertificationAuthorityBreadcrumbSegments } from "@/components/certification-authority/settings-breadcrumb-segments/adminCertificationAuthorityBreadcrumbSegments";
import { MultiSelectList } from "@/components/multi-select-list/MultiSelectList";
import { SettingsBreadcrumb } from "@/components/settings/settings-breadcrumb/SettingsBreadcrumb";
import { SettingsPageHeader } from "@/components/settings/settings-page-header/SettingsPageHeader";
import { graphqlErrorToast } from "@/components/toast/toast";

import { useCertificationsPage } from "./certifications.hooks";

const CertificationAuthorityCertificationsPage = () => {
  const { certificationAuthorityStructureId, certificationAuthorityId } =
    useParams<{
      certificationAuthorityStructureId: string;
      certificationAuthorityId: string;
    }>();

  const router = useRouter();

  const searchParams = useSearchParams();
  const searchParamsPage = searchParams.get("page");
  const currentPage = searchParamsPage ? Number(searchParamsPage) : 1;
  const onlyShowAddedItems = searchParams.get("onlyShowAddedItems") === "true";
  const searchFilter = searchParams.get("searchFilter");
  const showAllCertifications =
    searchParams.get("showAllCertifications") === "true";

  const {
    certificationAuthority,
    certificationPage,
    updateCertificationAuthorityCertifications,
  } = useCertificationsPage({
    certificationAuthorityStructureId,
    certificationAuthorityId,
    page: currentPage,
    onlyShowAddedCertifications: onlyShowAddedItems,
    showAllCertifications,
    searchFilter,
  });

  const handleShowAllCertificationsToggleChange = (checked: boolean) => {
    const queryParams = new URLSearchParams(searchParams);
    queryParams.set("showAllCertifications", checked ? "true" : "false");
    queryParams.set("page", "1");
    router.push(
      `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/certifications?${queryParams.toString()}`,
    );
  };

  const handleEmptyStateShowAllItemsButtonClick = ({
    currentQueryParams,
  }: {
    currentQueryParams: URLSearchParams;
  }) => {
    currentQueryParams.delete("showAllCertifications");
    router.push(
      `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/certifications?${currentQueryParams.toString()}`,
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
      await updateCertificationAuthorityCertifications.mutateAsync({
        certificationAuthorityId,
        certificationIds: selected
          ? [
              ...(certificationAuthority?.certifications?.map((c) => c.id) ||
                []),
              itemId,
            ]
          : certificationAuthority?.certifications
              .filter((c) => c.id !== itemId)
              .map((c) => c.id) || [],
      });
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  if (!certificationAuthority) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col">
        <SettingsPageHeader
          breadcrumb={
            <SettingsBreadcrumb
              currentPageLabel="Certifications gérées"
              homeLinkProps={{
                href: `/`,
              }}
              segments={getAdminCertificationAuthorityBreadcrumbSegments({
                certificationAuthorityStructureId,
                certificationAuthorityStructureLabel:
                  certificationAuthority.certificationAuthorityStructures.find(
                    (s) => s.id === certificationAuthorityStructureId,
                  )?.label || "inconnu",
                certificationAuthorityId,
                certificationAuthorityLabel: certificationAuthority.label,
              })}
            />
          }
          title="Certifications gérées"
          chapo={
            <>
              Ajouter toutes les certifications gérées depuis les certifications
              attribuées à la structure certificatrice. Vous pouvez ajouter une
              certification en dehors de la structure en utilisant l’option
              “afficher les certifications non gérées par la structure”.
            </>
          }
        />
        <MultiSelectList
          pageItems={certificationPage?.rows.map((c) => ({
            id: c.id,
            detail: `RNCP ${c.codeRncp}`,
            title: c.label,
            selected:
              certificationAuthority?.certifications.some(
                (cert) => cert.id === c.id,
              ) || false,
            detailsPageUrl: `/certifications/${c.id}`,
            start: c.visible !== undefined && (
              <>
                {c.visible ? (
                  <Badge className="mb-2" noIcon severity="success">
                    Visible
                  </Badge>
                ) : (
                  <Badge className="mb-2" noIcon severity="error">
                    Invisible
                  </Badge>
                )}
              </>
            ),
          }))}
          onSelectionChange={handleCertificationSelectionChange}
          paginationInfo={{
            totalItems: certificationPage?.info.totalRows || 0,
            totalPages: certificationPage?.info.totalPages || 1,
          }}
          itemTypeLabelForSearchResultsCount="certification(s)"
          onlyShowAddedItemsSwitchLabel="Afficher les certifications ajoutées uniquement"
          searchBarLabel="Rechercher par code RNCP, intitulé de certification etc..."
          emptyStateTitle="Aucune certification trouvée"
          emptyStateShowAllItemsButtonLabel="Afficher toutes les certifications"
          additionalElementsInFilterSidebar={
            <ToggleSwitch
              className="fr-toggle--border-bottom"
              inputTitle="Afficher toutes les certifications France VAE"
              label="Afficher toutes les certifications France VAE"
              labelPosition="left"
              onChange={handleShowAllCertificationsToggleChange}
              checked={showAllCertifications}
            />
          }
          onEmptyStateShowAllItemsButtonClick={
            handleEmptyStateShowAllItemsButtonClick
          }
        />
      </div>
    </div>
  );
};

export default CertificationAuthorityCertificationsPage;
