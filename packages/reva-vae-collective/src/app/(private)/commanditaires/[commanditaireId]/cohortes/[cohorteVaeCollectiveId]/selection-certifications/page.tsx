import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

import {
  MultiSelectItemProps,
  MultiSelectList,
} from "@/components/multi-select-list/MultiSelectList";

import {
  getCohorteById,
  searchCertificationsForSelectionCertificationsPage,
} from "./actions";

export default async function SelectionCertificationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ commanditaireId: string; cohorteVaeCollectiveId: string }>;
  searchParams: Promise<{ searchFilter?: string; page?: number }>;
}) {
  const { commanditaireId, cohorteVaeCollectiveId } = await params;
  const { searchFilter, page } = await searchParams;

  const currentPage = page ? Number(page) : 1;

  const cohorte = await getCohorteById(commanditaireId, cohorteVaeCollectiveId);

  if (!cohorte) {
    throw new Error("Cohorte non trouvée");
  }

  const certificationPage =
    await searchCertificationsForSelectionCertificationsPage({
      searchText: searchFilter,
      currentPage,
    });

  if (!certificationPage) {
    throw new Error("Certifications non trouvées");
  }

  const certificationsMultiSelectItems: MultiSelectItemProps[] =
    certificationPage.rows.map((certification) => {
      const subDomains = certification.domains.flatMap((d) =>
        d.children.map((sd) => sd.label),
      );
      return {
        id: certification.id,
        start: (
          <span className="flex gap-2 flex-wrap mb-3">
            {subDomains.map((sd) => (
              <Tag key={sd} small>
                {sd}
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
      <h1 className="mb-12">{cohorte?.nom}</h1>
      <MultiSelectList
        pageItems={certificationsMultiSelectItems}
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
