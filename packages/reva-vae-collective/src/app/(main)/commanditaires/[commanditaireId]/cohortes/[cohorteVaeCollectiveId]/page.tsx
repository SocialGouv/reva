import { Button } from "@codegouvfr/react-dsfr/Button";
import Link from "next/link";

import { RoleDependentBreadcrumb } from "@/components/role-dependent-breadcrumb/RoleDependentBreadcrumb";
import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

import { CertificationCard } from "./_components/certification-card/CertificationCard";
import { DeleteCohorteButton } from "./_components/delete-cohorte-button/DeleteCohorteButton";
import { GenerateCohorteCodeInscriptionButton } from "./_components/generate-cohorte-code-inscription-button/GenerateCohorteCodeInscriptionButton";
import { OrganismCard } from "./_components/organism-card/OrganismCard";
import { RegistrationCodeDisplay } from "./_components/registration-code-display/RegistrationCodeDisplay";
import { RegistrationUrlDisplay } from "./_components/registration-url-display/RegistrationUrlDisplay";

const websiteBaseUrl =
  (process.env.BASE_URL as string) || "http://localhost:3002";

const getCohorteById = async (
  commanditaireVaeCollectiveId: string,
  cohorteVaeCollectiveId: string,
) => {
  const accessToken = await getAccessTokenFromCookie();

  const result = throwUrqlErrors(
    await client.query(
      graphql(`
        query getCohorteByIdForCohortePage(
          $commanditaireVaeCollectiveId: ID!
          $cohorteVaeCollectiveId: ID!
        ) {
          vaeCollective_getCohorteVaeCollectiveById(
            commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
            cohorteVaeCollectiveId: $cohorteVaeCollectiveId
          ) {
            id
            nom
            status
            codeInscription
            certificationCohorteVaeCollectives {
              id
              certification {
                id
                label
                codeRncp
              }
              certificationCohorteVaeCollectiveOnOrganisms {
                id
                organism {
                  id
                  label
                  nomPublic
                  adresseNumeroEtNomDeRue
                  adresseCodePostal
                  adresseVille
                  emailContact
                  telephone
                }
              }
            }
          }
        }
      `),
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

  return result.data.vaeCollective_getCohorteVaeCollectiveById;
};

export default async function CohortePage({
  params,
}: {
  params: Promise<{ commanditaireId: string; cohorteVaeCollectiveId: string }>;
}) {
  const { commanditaireId, cohorteVaeCollectiveId } = await params;

  const cohorte = await getCohorteById(commanditaireId, cohorteVaeCollectiveId);

  const certification =
    cohorte.certificationCohorteVaeCollectives?.[0]?.certification;

  const organism =
    cohorte.certificationCohorteVaeCollectives?.[0]
      ?.certificationCohorteVaeCollectiveOnOrganisms?.[0]?.organism;

  const certificationSelected = !!certification;
  const organismSelected = !!organism;

  return (
    <div className="flex flex-col w-full">
      <RoleDependentBreadcrumb
        className="mt-0 mb-4"
        currentPageLabel={cohorte.nom}
        segments={[
          {
            label: "Cohortes",
            linkProps: {
              href: `/commanditaires/${commanditaireId}/cohortes`,
            },
          },
        ]}
      />
      <div className="flex justify-between items-center">
        <h1>{cohorte.nom}</h1>
        <Link
          className="text-sm bg-none p-2 fr-link fr-icon-edit-line fr-link--icon-left mb-6"
          href={`/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}/modifier-intitule`}
        >
          Modifier l’intitulé
        </Link>
      </div>
      <p className="text-xl mb-12">
        Paramétrez votre cohorte, afin de générer un code unique ainsi qu’un
        lien d’accès à transmettre aux candidats devant intégrer cette cohorte.
      </p>

      <CertificationCard
        href={
          cohorte.status === "BROUILLON"
            ? `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}/certifications`
            : `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}/certifications/${certification?.id}?certificationSelectionDisabled=true`
        }
        certification={certification}
      />

      <OrganismCard
        className="mt-8"
        commanditaireId={commanditaireId}
        cohorteVaeCollectiveId={cohorteVaeCollectiveId}
        organism={organism}
        //disabled si aucune certification n'est sélectionnée ou  si la cohorte est publiée et aucun organisme n'est sélectionnée
        //  (ce cas n'est pas sensé se produire aujourd'hui dans l'interface)
        disabled={
          !certificationSelected ||
          (cohorte.status !== "BROUILLON" && !organismSelected)
        }
        //readonly si la cohorte est publiée
        readonly={cohorte.status !== "BROUILLON"}
        certificationSelected={certificationSelected}
      />

      <hr className="mt-8 mb-2" />

      {cohorte.status === "BROUILLON" && (
        <>
          <GenerateCohorteCodeInscriptionButton
            commanditaireId={commanditaireId}
            cohorteVaeCollectiveId={cohorteVaeCollectiveId}
            nomCohorte={cohorte.nom}
            certificationCodeRncp={certification?.codeRncp ?? ""}
            certificationlabel={certification?.label ?? ""}
            aapLabel={organism?.label ?? ""}
            disabled={!organismSelected}
          />

          <DeleteCohorteButton
            commanditaireId={commanditaireId}
            cohorteVaeCollectiveId={cohorteVaeCollectiveId}
            nomCohorte={cohorte.nom}
          />
        </>
      )}

      {cohorte.status === "PUBLIE" && (
        <div className="flex flex-col gap-4">
          <p className="text-lg mb-2">
            Afin de permettre à vos candidats de s’inscrire sur la plateforme,
            et d’être automatiquement orientés vers la certification visée et
            l’AAP sélectionné, 2 possibilités.
          </p>
          <p className="text-lg mb-0">
            Nous vous invitons à leur transmettre ce code. Ils pourront le
            renseigner sur la page d’inscription du site institutionnel :
          </p>
          <RegistrationCodeDisplay
            registrationCode={cohorte.codeInscription || ""}
          />
          <p className="text-lg mb-0 mt-6">
            Vous pouvez également leur transmettre ce lien qui les orientera
            directement vers la page d’inscription à cette cohorte :{" "}
          </p>
          <RegistrationUrlDisplay
            registrationUrl={`${websiteBaseUrl}/inscription-candidat/vae-collective?codeInscription=${cohorte.codeInscription}`}
          />
        </div>
      )}

      <Button
        className="mt-12"
        priority="secondary"
        linkProps={{
          href: `/commanditaires/${commanditaireId}/cohortes`,
        }}
      >
        Retour
      </Button>
    </div>
  );
}
