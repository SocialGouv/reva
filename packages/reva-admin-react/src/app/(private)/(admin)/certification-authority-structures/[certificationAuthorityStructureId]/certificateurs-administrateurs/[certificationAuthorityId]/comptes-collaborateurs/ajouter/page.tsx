"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { AddCertificationAuthorityLocalAccountPageContent } from "@/components/certification-authority/local-account/add-local-account-page-content/AddCertificationAuthorityLocalAccountPageContent";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityAndStructureForAdminAddLocalAccountPage =
  graphql(`
    query getCertificationAuthorityAndStructureForAdminAddLocalAccountPage(
      $certificationAuthorityId: ID!
      $certificationAuthorityStructureId: ID!
    ) {
      certification_authority_getCertificationAuthority(
        id: $certificationAuthorityId
      ) {
        id
        label
      }
      certification_authority_getCertificationAuthorityStructure(
        id: $certificationAuthorityStructureId
      ) {
        id
        label
      }
    }
  `);

export default function AddLocalAccountPage() {
  const { certificationAuthorityId, certificationAuthorityStructureId } =
    useParams<{
      certificationAuthorityId: string;
      certificationAuthorityStructureId: string;
    }>();
  const { graphqlClient } = useGraphQlClient();

  const { data } = useQuery({
    queryKey: [
      "getCertificationAuthorityAndStructureForAdminAddLocalAccountPage",
      certificationAuthorityId,
    ],
    queryFn: () =>
      graphqlClient.request(
        getCertificationAuthorityAndStructureForAdminAddLocalAccountPage,
        {
          certificationAuthorityId,
          certificationAuthorityStructureId,
        },
      ),
  });

  const certificationAuthorityStructureLabel =
    data?.certification_authority_getCertificationAuthorityStructure?.label;

  const certificationAuthorityLabel =
    data?.certification_authority_getCertificationAuthority?.label;

  return (
    <div
      className="flex flex-col w-full"
      data-testid="add-certification-authority-local-account-page"
    >
      <Breadcrumb
        segments={[
          {
            label: "Structures certificatrices",
            linkProps: {
              href: `/certification-authority-structures/`,
            },
          },
          {
            label: certificationAuthorityStructureLabel,
            linkProps: {
              href: `/certification-authority-structures/${certificationAuthorityStructureId}/`,
            },
          },
          {
            label: certificationAuthorityLabel,
            linkProps: {
              href: `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/`,
            },
          },
        ]}
        currentPageLabel="Nouveau compte local"
      />
      <h1>Nouveau compte local</h1>
      <p className="mb-12">
        Retrouvez l’ensemble des informations liées à ce compte local.
      </p>
      <AddCertificationAuthorityLocalAccountPageContent
        generalInformationPageUrl={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/comptes-collaborateurs/ajouter/informations-generales`}
      />
      <Button
        className="mt-12"
        priority="secondary"
        linkProps={{
          href: `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/`,
        }}
      >
        Annuler
      </Button>
    </div>
  );
}
