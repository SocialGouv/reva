"use client";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { AddCertificationAuthorityLocalAccountPageContent } from "@/components/certification-authority/local-account/add-local-account-page-content/AddCertificationAuthorityLocalAccountPageContent";
import { getAdminCertificationAuthorityBreadcrumbSegments } from "@/components/certification-authority/settings-breadcrumb-segments/adminCertificationAuthorityBreadcrumbSegments";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SettingsBreadcrumb } from "@/components/settings/settings-breadcrumb/SettingsBreadcrumb";
import { SettingsPageHeader } from "@/components/settings/settings-page-header/SettingsPageHeader";

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
    data?.certification_authority_getCertificationAuthorityStructure?.label ||
    "";

  const certificationAuthorityLabel =
    data?.certification_authority_getCertificationAuthority?.label || "";

  return (
    <div
      className="flex flex-col w-full"
      data-testid="add-certification-authority-local-account-page"
    >
      <SettingsPageHeader
        breadcrumb={
          <SettingsBreadcrumb
            currentPageLabel="Nouveau compte local"
            homeLinkProps={{
              href: `/`,
            }}
            segments={getAdminCertificationAuthorityBreadcrumbSegments({
              certificationAuthorityStructureId,
              certificationAuthorityStructureLabel,
              certificationAuthorityId,
              certificationAuthorityLabel,
            })}
          />
        }
        title="Nouveau compte local"
        chapo="Retrouvez l’ensemble des informations liées à ce compte local."
      />
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
