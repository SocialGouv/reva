"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { MultiSelectList } from "@/components/multi-select-list/MultiSelectList";
import { graphqlErrorToast } from "@/components/toast/toast";

import { useParcoursCertificationPage } from "./parcoursCertification.hooks";

export default function ParcoursPage() {
  const { certificationAuthorityId, certificationId } = useParams<{
    certificationAuthorityId: string;
    certificationId: string;
  }>();

  const searchParams = useSearchParams();
  const searchParamsPage = searchParams.get("page");
  const currentPage = searchParamsPage ? Number(searchParamsPage) : 1;
  const searchFilter = searchParams.get("searchFilter");
  const onlyShowAddedItems = searchParams.get("onlyShowAddedItems") === "true";

  const {
    certification,
    certificationAuthorityParcours,
    getCertificationAndParcoursStatus,
    updateParcoursForCertificationAndCertificationAuthority,
  } = useParcoursCertificationPage({
    certificationId,
    certificationAuthorityId,
    page: currentPage,
    searchFilter,
    onlyShowAddedParcours: onlyShowAddedItems,
  });

  const certificationAuthorityParcoursIds = useMemo(
    () => certificationAuthorityParcours?.map((parcours) => parcours.id) || [],
    [certificationAuthorityParcours],
  );

  const handleParcoursSelectionChange = async ({
    itemId,
    selected,
  }: {
    itemId: string;
    selected: boolean;
  }) => {
    try {
      await updateParcoursForCertificationAndCertificationAuthority.mutateAsync(
        {
          certificationId,
          certificationAuthorityId,
          parcoursCertificationIds: selected
            ? [...certificationAuthorityParcoursIds, itemId]
            : certificationAuthorityParcoursIds.filter((id) => id !== itemId),
        },
      );
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  if (getCertificationAndParcoursStatus !== "success" || !certification) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <Breadcrumb
        segments={[
          {
            label: "Paramètres",
            linkProps: {
              href: `/certification-authorities/${certificationAuthorityId}/settings/`,
            },
          },
          {
            label: "Certifications gérées",
            linkProps: {
              href: `/certification-authorities/${certificationAuthorityId}/settings/certifications`,
            },
          },
        ]}
        currentPageLabel={certification.label}
      />
      <h1>{certification.label}</h1>
      <p className="mb-12">
        Sélectionnez les parcours que votre établissement propose pour cette
        mention. Ces parcours apparaîtront sur la fiche certification consultée
        par les candidats.
      </p>
      <MultiSelectList
        pageItems={certification.parcours.rows.map((parcours) => ({
          id: parcours.id,
          title: parcours.label,
          desc: parcours.nomEtablissement,
          selected: !!certificationAuthorityParcoursIds?.includes(parcours.id),
        }))}
        onSelectionChange={handleParcoursSelectionChange}
        paginationInfo={{
          totalItems: certification.parcours.info.totalRows,
          totalPages: certification.parcours.info.totalPages,
        }}
        onlyShowAddedItemsSwitchLabel="Afficher uniquement les parcours ajoutés"
        emptyStateTitle="Aucun parcours trouvé"
        emptyStateShowAllItemsButtonLabel="Afficher tous les parcours"
      />
      <Button
        priority="tertiary"
        className="mt-10"
        linkProps={{
          href: `/certification-authorities/${certificationAuthorityId}/settings/certifications/`,
        }}
      >
        Retour
      </Button>
    </div>
  );
}
