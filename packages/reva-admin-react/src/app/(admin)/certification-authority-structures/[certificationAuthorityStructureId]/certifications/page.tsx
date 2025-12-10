"use client";

import { useParams, useSearchParams } from "next/navigation";

import { MultiSelectList } from "@/components/multi-select-list/MultiSelectList";
import { graphqlErrorToast } from "@/components/toast/toast";

import { CertificationAuthorityStructureBreadcrumb } from "../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";

import { useCertificationsPage } from "./certifications.hooks";

const CertificationAuthorityStructureCertificationsPage = () => {
  const { certificationAuthorityStructureId } = useParams<{
    certificationAuthorityStructureId: string;
  }>();

  const searchParams = useSearchParams();
  const searchParamsPage = searchParams.get("page");
  const currentPage = searchParamsPage ? Number(searchParamsPage) : 1;
  const onlyShowAddedItems = searchParams.get("onlyShowAddedItems") === "true";
  const searchFilter = searchParams.get("searchFilter");

  const {
    certificationAuthorityStructure,
    certificationPage,
    updateCertificationAuthorityStructureCertifications,
  } = useCertificationsPage({
    certificationAuthorityStructureId,
    page: currentPage,
    onlyShowAddedCertifications: onlyShowAddedItems,
    searchFilter,
  });

  const handleCertificationSelectionChange = async ({
    itemId,
    selected,
  }: {
    itemId: string;
    selected: boolean;
  }) => {
    try {
      await updateCertificationAuthorityStructureCertifications.mutateAsync({
        certificationAuthorityStructureId,
        certificationIds: selected
          ? [
              ...(certificationAuthorityStructure?.certifications?.map(
                (c) => c.id,
              ) || []),
              itemId,
            ]
          : certificationAuthorityStructure?.certifications
              .filter((c) => c.id !== itemId)
              .map((c) => c.id) || [],
      });
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  if (!certificationAuthorityStructure) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1">
      {certificationAuthorityStructure && (
        <div className="flex flex-col">
          <CertificationAuthorityStructureBreadcrumb
            certificationAuthorityStructureId={
              certificationAuthorityStructureId
            }
            certificationAuthorityStructureLabel={
              certificationAuthorityStructure.label
            }
            pageLabel={"Certifications gérées"}
          />
          <h1>Certifications gérées</h1>
          <p className="text-xl">
            Sélectionnez toutes les certifications proposées par la structure
            certificatrice.
          </p>
          <MultiSelectList
            pageItems={certificationPage?.rows.map((c) => ({
              id: c.id,
              detail: `RNCP ${c.codeRncp}`,
              title: c.label,
              selected:
                certificationAuthorityStructure?.certifications.some(
                  (cert) => cert.id === c.id,
                ) || false,
              detailsPageUrl: `/certifications/${c.id}`,
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
          />
        </div>
      )}
    </div>
  );
};

export default CertificationAuthorityStructureCertificationsPage;
