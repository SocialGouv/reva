import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

import { MultiSelectItemProps } from "@/components/multi-select-list/MultiSelectList";
import { RoleDependentBreadcrumb } from "@/components/role-dependent-breadcrumb/RoleDependentBreadcrumb";

import { CertificationList } from "./_components/certification-list/CertificationList";
import {
  getCohorteById,
  searchCertificationsForSelectionCertificationsPage,
} from "./actions";

export default async function SelectionCertificationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ commanditaireId: string; cohorteVaeCollectiveId: string }>;
  searchParams: Promise<{
    searchFilter?: string;
    page?: number;
    onlyShowAddedItems?: string;
  }>;
}) {
  const { commanditaireId, cohorteVaeCollectiveId } = await params;
  const { searchFilter, page, onlyShowAddedItems } = await searchParams;

  const currentPage = page ? Number(page) : 1;
  const onlyShowAddedItemsValue = onlyShowAddedItems === "true";

  const cohorte = await getCohorteById(commanditaireId, cohorteVaeCollectiveId);

  if (!cohorte) {
    throw new Error("Cohorte non trouvée");
  }

  const certificationPage =
    await searchCertificationsForSelectionCertificationsPage({
      searchText: searchFilter,
      currentPage,
      cohorteVaeCollectiveIdFilter: onlyShowAddedItemsValue
        ? cohorteVaeCollectiveId
        : undefined,
    });

  if (!certificationPage) {
    throw new Error("Certifications non trouvées");
  }

  const certificationsMultiSelectItems: MultiSelectItemProps[] =
    certificationPage.rows.map((certification) => {
      const subDomains = [
        ...new Set(certification.domains.flatMap((d) => d.children)),
      ];
      return {
        id: certification.id,
        start: (
          <span className="flex gap-2 flex-wrap mb-3" key={certification.id}>
            {subDomains.map((sd) => (
              <Tag key={sd.id} small>
                {sd.label}
              </Tag>
            ))}
          </span>
        ),
        title: certification.label,
        detail: "RNCP " + certification.codeRncp,
        selected: cohorte.certificationCohorteVaeCollectives.some(
          (c) => c.certification.id === certification.id,
        ),
        detailsPageUrl: `./certifications/${certification.id}?certificationSelectionDisabled=true`,
      };
    });

  return (
    <div className="flex flex-col w-full">
      <RoleDependentBreadcrumb
        className="mt-0 mb-4"
        currentPageLabel="Certifications"
        segments={[
          {
            label: "Cohortes",
            linkProps: {
              href: `/commanditaires/${commanditaireId}/cohortes`,
            },
          },
          {
            label: cohorte.nom,
            linkProps: {
              href: `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}`,
            },
          },
        ]}
      />
      <h1>Certifications</h1>
      <p className="text-xl mb-12">
        Ajoutez la (ou les) certification(s) visée(s) par vos candidats. Une
        fiche détaillée vous apporte des informations clefs avant de valider
        votre sélection.
      </p>
      <CertificationList
        commanditaireVaeCollectiveId={commanditaireId}
        cohorteVaeCollectiveId={cohorteVaeCollectiveId}
        organismId={cohorte.organismId}
        selectedCertificationIds={cohorte.certificationCohorteVaeCollectives.map(
          (c) => c.certification.id,
        )}
        certificationsPageItems={certificationsMultiSelectItems}
        paginationInfo={{
          totalPages: certificationPage.info.totalPages,
          totalItems: certificationPage.info.totalRows,
        }}
      />
      <Button
        priority="secondary"
        linkProps={{
          href: `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}`,
        }}
      >
        Retour
      </Button>
    </div>
  );
}
