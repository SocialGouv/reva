"use client";

import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useState } from "react";

import {
  MultiSelectItemProps,
  MultiSelectList,
} from "@/components/multi-select-list/MultiSelectList";

import {
  isOrganismAttachedToCertifications,
  updateCertifications,
} from "./actions";

const modal = createModal({
  id: "confirm-certification-selection",
  isOpenedByDefault: false,
});

export const CertificationList = ({
  commanditaireVaeCollectiveId,
  cohorteVaeCollectiveId,
  organismId,
  selectedCertificationIds,
  certificationsPageItems,
  paginationInfo,
}: {
  commanditaireVaeCollectiveId: string;
  cohorteVaeCollectiveId: string;
  organismId?: string | null;
  selectedCertificationIds: string[];
  certificationsPageItems: MultiSelectItemProps[];
  paginationInfo: {
    totalPages: number;
    totalItems: number;
  };
}) => {
  const [modalState, setModalState] = useState<{
    certificationIds: string[];
    certificationLabel: string;
  } | null>(null);

  const handleCertificationSelectionChange = async ({
    itemId,
    selected,
  }: {
    itemId: string;
    selected: boolean;
  }) => {
    const newCertificationIds = selected
      ? [...selectedCertificationIds, itemId]
      : selectedCertificationIds.filter((cid) => cid !== itemId);

    let needConfirmation = false;
    console.log("organismId", organismId);
    console.log("itemId", itemId);
    console.log("newCertificationIds", newCertificationIds);
    console.log("selected", selected);

    if (selected && organismId) {
      const organismAttachedToCertifications =
        await isOrganismAttachedToCertifications({
          organismId,
          certificationIds: [itemId],
        });
      console.log(
        "organismAttachedToCertifications",
        organismAttachedToCertifications,
      );
      if (!organismAttachedToCertifications) {
        needConfirmation = true;
      }
    }

    if (needConfirmation) {
      const certification = certificationsPageItems.find(
        (c) => c.id === itemId,
      );
      setModalState({
        certificationIds: newCertificationIds,
        certificationLabel:
          certification?.detail + " " + certification?.title?.toString(),
      });
      modal.open();
    } else {
      await handleCertificationsUpdate(newCertificationIds);
    }
  };

  const handleCertificationsUpdate = async (newCertificationIds: string[]) =>
    updateCertifications({
      commanditaireVaeCollectiveId,
      cohorteVaeCollectiveId,
      certificationIds: newCertificationIds,
    });

  return (
    <>
      <modal.Component
        iconId="fr-icon-warning-fill"
        title={
          <span className="ml-2">
            Ajout d’une certification non-gérée par l’AAP sélectionné
          </span>
        }
        size="large"
        buttons={[
          {
            priority: "primary",
            onClick: () =>
              handleCertificationsUpdate(modalState?.certificationIds || []),
            children: "Confirmer",
          },
        ]}
      >
        <div className="flex flex-col gap-4">
          <p>
            Cette certification{" "}
            <strong>{modalState?.certificationLabel}</strong> n'est pas gérée
            par l’AAP que vous avez sélectionné. Si vous ajoutez cette
            certification, vous devrez sélectionner un nouvel AAP.
          </p>
          <p>Souhaitez-vous ajouter cette certification à votre cohorte ?</p>
        </div>
      </modal.Component>

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
    </>
  );
};
