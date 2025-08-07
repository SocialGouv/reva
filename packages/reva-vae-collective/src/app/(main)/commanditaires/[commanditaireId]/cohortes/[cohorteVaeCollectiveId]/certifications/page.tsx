import Button from "@codegouvfr/react-dsfr/Button";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";

import { RoleDependentBreadcrumb } from "@/components/role-dependent-breadcrumb/RoleDependentBreadcrumb";

import { CertificationCard } from "./_components/certification-card/CertificationCard";
import { CertificationsSearchBar } from "./_components/certifications-search-bar/CertificationsSearchBar";
import { searchCertificationsAndGetCohorteInfo } from "./actions";

const RECORDS_PER_PAGE = 10;

export default async function CertificationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ commanditaireId: string; cohorteVaeCollectiveId: string }>;
  searchParams: Promise<{ searchText?: string; page?: number }>;
}) {
  const { commanditaireId, cohorteVaeCollectiveId } = await params;

  const { searchText, page } = await searchParams;

  const currentPage = page ? Number(page) : 1;

  const { certifications, cohorteVaeCollective } =
    await searchCertificationsAndGetCohorteInfo({
      commanditaireVaeCollectiveId: commanditaireId,
      cohorteVaeCollectiveId,
      searchText,
      offset: (currentPage - 1) * RECORDS_PER_PAGE,
      limit: RECORDS_PER_PAGE,
    });

  if (!cohorteVaeCollective) {
    throw new Error("Cohorte non trouvée");
  }

  return (
    <div className="flex flex-col">
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
            label: cohorteVaeCollective.nom,
            linkProps: {
              href: `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}`,
            },
          },
        ]}
      />
      <h1>Certifications</h1>
      <p className="text-xl mb-12">
        Sélectionnez la certification visée par vos candidats. Une fiche
        détaillée vous apporte des informations clefs avant de valider votre
        sélection.
      </p>
      <CertificationsSearchBar
        commanditaireId={commanditaireId}
        cohorteVaeCollectiveId={cohorteVaeCollectiveId}
      />

      <ul className="mt-12 list-none px-0 flex flex-col gap-4">
        {certifications?.rows.map((certification) => (
          <li key={certification.id}>
            <CertificationCard
              commanditaireId={commanditaireId}
              cohorteVaeCollectiveId={cohorteVaeCollectiveId}
              certification={certification}
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
          count={Math.ceil(certifications.info.totalRows / RECORDS_PER_PAGE)}
          getPageLinkProps={(page) => ({
            href: `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}/certifications?page=${page}&searchText=${searchText || ""}`,
          })}
        />
      </div>
    </div>
  );
}
