"use client";

import { useParams, useSearchParams } from "next/navigation";

import { MultiSelectList } from "@/components/multi-select-list/MultiSelectList";
import { graphqlErrorToast } from "@/components/toast/toast";

import { CertificationAuthorityStructureBreadcrumb } from "../../../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";

import { useCertificationsPage } from "./certifications.hooks";

const CertificationAuthorityCertificationsPage = () => {
  const { certificationAuthorityStructureId, certificationAuthorityId } =
    useParams<{
      certificationAuthorityStructureId: string;
      certificationAuthorityId: string;
    }>();

  const searchParams = useSearchParams();
  const searchParamsPage = searchParams.get("page");
  const currentPage = searchParamsPage ? Number(searchParamsPage) : 1;
  const onlyShowAddedItems = searchParams.get("onlyShowAddedItems") === "true";
  const searchFilter = searchParams.get("searchFilter");

  const {
    certificationAuthority,
    certificationPage,
    updateCertificationAuthorityCertifications,
  } = useCertificationsPage({
    certificationAuthorityId,
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
        <CertificationAuthorityStructureBreadcrumb
          certificationAuthorityStructureId={certificationAuthorityStructureId}
          certificationAuthorityStructureLabel={
            certificationAuthority.certificationAuthorityStructures.find(
              (s) => s.id === certificationAuthorityStructureId,
            )?.label || "inconnu"
          }
          certificationAuthorityId={certificationAuthorityId}
          certificationAuthoritylabel={certificationAuthority.label}
          pageLabel="Certifications gérées"
        />
        <h1>Certifications gérées</h1>
        <p className="text-xl">
          Cochez les certifications proposées par la structure certificatrice.
          Vous pouvez choisir une ou plusieurs certifications.
        </p>
        <MultiSelectList
          pageItems={certificationPage?.rows.map((c) => ({
            id: c.id,
            detail: `RNCP ${c.codeRncp}`,
            title: c.label,
            selected:
              certificationAuthority?.certifications.some(
                (cert) => cert.id === c.id,
              ) || false,
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
    </div>
  );
};

export default CertificationAuthorityCertificationsPage;
