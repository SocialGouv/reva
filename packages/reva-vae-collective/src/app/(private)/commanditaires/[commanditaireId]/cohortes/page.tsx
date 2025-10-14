import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import { format } from "date-fns";
import { redirect } from "next/navigation";

import { AapSelectionAdvice } from "@/components/aap-selection-advice/AapSelectionAdvice";
import { RoleDependentBreadcrumb } from "@/components/role-dependent-breadcrumb/RoleDependentBreadcrumb";
import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

const RECORDS_PER_PAGE = 10;

const loadCommanditaireAndCohortes = async ({
  commanditaireVaeCollectiveId,
  cohortePage = 1,
}: {
  commanditaireVaeCollectiveId: string;
  cohortePage?: number;
}) => {
  const accessToken = await getAccessTokenFromCookie();

  const result = throwUrqlErrors(
    await client.query(
      graphql(`
        query commanditaireVaeCollectiveForCohortesPage(
          $commanditaireVaeCollectiveId: ID!
          $offset: Int!
          $limit: Int!
        ) {
          vaeCollective_getCommanditaireVaeCollective(
            commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
          ) {
            id
            raisonSociale
            cohorteVaeCollectives(offset: $offset, limit: $limit) {
              info {
                totalRows
              }
              rows {
                id
                nom
                status
                createdAt
                certificationCohorteVaeCollectives {
                  id
                  certification {
                    id
                    label
                  }
                  certificationCohorteVaeCollectiveOnOrganisms {
                    id
                    organism {
                      id
                      label
                      nomPublic
                    }
                  }
                }
              }
            }
          }
        }
      `),
      {
        commanditaireVaeCollectiveId,
        offset: (cohortePage - 1) * RECORDS_PER_PAGE,
        limit: RECORDS_PER_PAGE,
      },
      {
        fetchOptions: { headers: { Authorization: `Bearer ${accessToken}` } },
      },
    ),
  );
  return result.data?.vaeCollective_getCommanditaireVaeCollective;
};

export default async function CohortesPage({
  params,
  searchParams,
}: {
  params: Promise<{ commanditaireId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { commanditaireId } = await params;
  const { page } = await searchParams;

  const currentPage = page ? Number(page) : 1;

  const commanditaire = await loadCommanditaireAndCohortes({
    commanditaireVaeCollectiveId: commanditaireId,
    cohortePage: currentPage,
  });

  if (!commanditaire) {
    throw new Error("Commanditaire non trouvé");
  }

  if (commanditaire.cohorteVaeCollectives.info.totalRows === 0) {
    redirect(`/commanditaires/${commanditaireId}/cohortes/aucune-cohorte/`);
  }

  return (
    <div className="fr-container flex flex-col">
      <RoleDependentBreadcrumb
        className="mt-0 mb-4"
        currentPageLabel="Cohortes"
        segments={[]}
      />

      <h1 className="">Cohortes</h1>
      <AapSelectionAdvice className="text-xl mb-12" />
      <Button
        className="ml-auto mb-4"
        priority="secondary"
        linkProps={{
          href: `/commanditaires/${commanditaireId}/cohortes/nouvelle-cohorte/`,
        }}
      >
        Créer une cohorte
      </Button>

      <ul className="flex flex-col gap-4 list-none px-0 my-0">
        {commanditaire?.cohorteVaeCollectives?.rows?.map((cohorte) => {
          const certification = cohorte.certificationCohorteVaeCollectives[0];
          const organism =
            certification?.certificationCohorteVaeCollectiveOnOrganisms?.[0];
          return (
            <li key={cohorte.id}>
              <Card
                data-testid="cohorte-card"
                enlargeLink
                size="small"
                title={cohorte.nom}
                start={
                  <>
                    {cohorte.status === "BROUILLON" && (
                      <Badge
                        severity="warning"
                        small
                        className="mb-3"
                        data-testid="draft-status-badge"
                      >
                        En cours de paramètrage
                      </Badge>
                    )}
                    {cohorte.status === "PUBLIE" && (
                      <Badge
                        severity="success"
                        small
                        className="mb-3"
                        data-testid="active-status-badge"
                      >
                        Active
                      </Badge>
                    )}
                  </>
                }
                desc={
                  <>
                    {certification && (
                      <span className="text-sm" data-testid="certification">
                        {certification.certification.label}
                      </span>
                    )}
                    {organism && (
                      <>
                        <br />
                        <span className="text-sm" data-testid="organism">
                          {organism.organism.nomPublic ||
                            organism.organism.label}
                        </span>
                      </>
                    )}
                  </>
                }
                endDetail={`Créée le ${format(cohorte.createdAt, "dd/MM/yyyy")}`}
                linkProps={{
                  href: `/commanditaires/${commanditaireId}/cohortes/${cohorte.id}`,
                }}
              ></Card>
            </li>
          );
        })}
      </ul>

      <Pagination
        classes={{
          root: "mt-12 ml-auto",
        }}
        showFirstLast={false}
        defaultPage={currentPage}
        count={Math.ceil(
          commanditaire.cohorteVaeCollectives.info.totalRows / RECORDS_PER_PAGE,
        )}
        getPageLinkProps={(page) => ({
          href: `/commanditaires/${commanditaireId}/cohortes?page=${page}`,
        })}
      />
    </div>
  );
}
