import Button from "@codegouvfr/react-dsfr/Button";

import { CertificationCard } from "@/components/certification-card/CertificationCard";
import { RoleDependentBreadcrumb } from "@/components/role-dependent-breadcrumb/RoleDependentBreadcrumb";
import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

const getCohorteCertificationsSelectionneesQuery = graphql(`
  query getCohorteByIdForCohorteCertificationsSelectionneesPage(
    $commanditaireVaeCollectiveId: ID!
    $cohorteVaeCollectiveId: ID!
  ) {
    vaeCollective_getCohorteVaeCollectiveById(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
      cohorteVaeCollectiveId: $cohorteVaeCollectiveId
    ) {
      id
      nom
      certificationCohorteVaeCollectives {
        id
        certification {
          id
          label
          codeRncp
          certificationAuthorityStructure {
            label
          }
          domains {
            id
            label
            children {
              id
              label
            }
          }
        }
      }
    }
  }
`);

const getCohorteById = async ({
  commanditaireVaeCollectiveId,
  cohorteVaeCollectiveId,
}: {
  commanditaireVaeCollectiveId: string;
  cohorteVaeCollectiveId: string;
}) => {
  const accessToken = await getAccessTokenFromCookie();

  const result = throwUrqlErrors(
    await client.query(
      getCohorteCertificationsSelectionneesQuery,
      {
        commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId,
      },
      {
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
    ),
  );

  if (!result.data?.vaeCollective_getCohorteVaeCollectiveById) {
    throw new Error("Cohorte non trouvée");
  }

  return {
    cohorteVaeCollective: result.data.vaeCollective_getCohorteVaeCollectiveById,
    certifications:
      result.data.vaeCollective_getCohorteVaeCollectiveById.certificationCohorteVaeCollectives.map(
        (certificationCohorte) => certificationCohorte.certification,
      ),
  };
};

export default async function CertificationsSelectionneesPage({
  params,
}: {
  params: Promise<{ commanditaireId: string; cohorteVaeCollectiveId: string }>;
}) {
  const { commanditaireId, cohorteVaeCollectiveId } = await params;

  const { cohorteVaeCollective, certifications } = await getCohorteById({
    commanditaireVaeCollectiveId: commanditaireId,
    cohorteVaeCollectiveId,
  });

  if (!cohorteVaeCollective) {
    throw new Error("Cohorte non trouvée");
  }

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
            label: cohorteVaeCollective.nom,
            linkProps: {
              href: `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}`,
            },
          },
        ]}
      />
      <h1>Certifications</h1>

      <ul className="mt-12 list-none px-0 flex flex-col gap-4">
        {certifications.map((certification) => (
          <li key={certification.id}>
            <CertificationCard
              certification={certification}
              detailsHref={`/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}/certifications/${certification.id}?certificationSelectionDisabled=true`}
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
      </div>
    </div>
  );
}
