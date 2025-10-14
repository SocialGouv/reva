import Button from "@codegouvfr/react-dsfr/Button";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";

import { AapSelectionAdvice } from "@/components/aap-selection-advice/AapSelectionAdvice";
import { RoleDependentBreadcrumb } from "@/components/role-dependent-breadcrumb/RoleDependentBreadcrumb";

import { OrganismCard } from "./_components/organism-card/OrganismCard";
import { OrganismsSearchBar } from "./_components/organisms-search-bar/OrganismsSearchBar";
import { searchOrganismsAndGetCohorteInfo } from "./actions";

const RECORDS_PER_PAGE = 10;

export default async function AapsPage({
  params,
  searchParams,
}: {
  params: Promise<{ commanditaireId: string; cohorteVaeCollectiveId: string }>;
  searchParams: Promise<{ searchText?: string; page?: number }>;
}) {
  const { commanditaireId, cohorteVaeCollectiveId } = await params;

  const { searchText, page } = await searchParams;

  const currentPage = page ? Number(page) : 1;

  const { cohorte, organisms } = await searchOrganismsAndGetCohorteInfo({
    commanditaireVaeCollectiveId: commanditaireId,
    cohorteVaeCollectiveId,
    searchText,
    offset: (currentPage - 1) * RECORDS_PER_PAGE,
    limit: RECORDS_PER_PAGE,
  });

  return (
    <div className="flex flex-col fr-container">
      <RoleDependentBreadcrumb
        className="mt-0 mb-4"
        currentPageLabel="Architectes Accompagnateur de Parcours"
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
      <h1>Architectes Accompagnateur de Parcours</h1>

      <p className="text-xl mb-0 leading-relaxed">
        Choisissez l’AAP en charge d’accompagner tous vos collaborateurs
        intégrant cette cohorte.
      </p>
      <AapSelectionAdvice className="text-xl mb-12 leading-relaxed" />

      <OrganismsSearchBar
        commanditaireId={commanditaireId}
        cohorteVaeCollectiveId={cohorteVaeCollectiveId}
      />

      <ul className="mt-12 list-none px-0 flex flex-col gap-4">
        {organisms.rows.map((organism) => (
          <li key={organism.id}>
            <OrganismCard
              commanditaireId={commanditaireId}
              cohorteVaeCollectiveId={cohorteVaeCollectiveId}
              organism={organism}
            />
          </li>
        ))}
      </ul>

      <div className="flex mt-12 items-start">
        <Button
          priority="secondary"
          linkProps={{
            href: `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}`,
          }}
        >
          Retour
        </Button>

        <Pagination
          classes={{
            root: "ml-auto",
          }}
          showFirstLast={false}
          defaultPage={currentPage}
          count={Math.ceil(organisms.info.totalRows / RECORDS_PER_PAGE)}
          getPageLinkProps={(page) => ({
            href: `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}/aaps?page=${page}&searchText=${searchText || ""}`,
          })}
        />
      </div>
    </div>
  );
}
