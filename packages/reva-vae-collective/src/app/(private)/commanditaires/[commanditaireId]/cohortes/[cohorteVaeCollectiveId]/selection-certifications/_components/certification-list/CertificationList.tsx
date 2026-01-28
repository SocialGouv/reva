"use client";

import {
  MultiSelectItemProps,
  MultiSelectList,
} from "@/components/multi-select-list/MultiSelectList";

import { updateCertifications } from "./actions";

export const CertificationList = ({
  commanditaireVaeCollectiveId,
  cohorteVaeCollectiveId,
  selectedCertificationIds,
  certificationsPageItems,
  paginationInfo,
}: {
  commanditaireVaeCollectiveId: string;
  cohorteVaeCollectiveId: string;
  selectedCertificationIds: string[];
  certificationsPageItems: MultiSelectItemProps[];
  paginationInfo: {
    totalPages: number;
    totalItems: number;
  };
}) => {
  const handleCertificationSelectionChange = async ({
    itemId,
    selected,
  }: {
    itemId: string;
    selected: boolean;
  }) => {
    const newSelectedCertificationIds = selected
      ? [...selectedCertificationIds, itemId]
      : selectedCertificationIds.filter((cid) => cid !== itemId);

    await updateCertifications({
      commanditaireVaeCollectiveId,
      cohorteVaeCollectiveId,
      certificationIds: newSelectedCertificationIds,
    });
  };

  return (
    <MultiSelectList
      pageItems={certificationsPageItems}
      paginationInfo={paginationInfo}
      onSelectionChange={handleCertificationSelectionChange}
      itemTypeLabelForSearchResultsCount="certification(s)"
      onlyShowAddedItemsSwitchLabel="Afficher les certifications ajoutées uniquement"
      searchBarLabel="Rechercher par code RNCP, intitulé de certification etc..."
      emptyStateTitle="Aucune certification trouvée"
      emptyStateShowAllItemsButtonLabel="Afficher toutes les certifications"
    />
  );
};
