"use client";
import { useAuth } from "@/components/auth/auth";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import DomainesCcnsDegreesForm from "../../_components/domaines-ccns-degrees-form/DomainesCcnsDegreesForm";

const getOrganismQuery = graphql(`
  query getOrganismForDomainesCcnsDegreesRemotePage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      maisonMereAAP {
        raisonSociale
      }
    }
  }
`);

const InformationsRemotePage = () => {
  const { organismId, "maison-mere-id": maisonMereAAPId } = useParams<{
    organismId: string;
    "maison-mere-id": string;
  }>();
  const { isAdmin } = useAuth();
  const { graphqlClient } = useGraphQlClient();
  const { data: getOrganismResponse } = useQuery({
    queryKey: [organismId, "organism"],
    queryFn: () =>
      graphqlClient.request(getOrganismQuery, {
        organismId,
      }),
  });
  const organism = getOrganismResponse?.organism_getOrganism;

  return (
    <div className="flex flex-col">
      <Breadcrumb
        currentPageLabel={"Filières, branches et niveaux"}
        homeLinkProps={{
          href: `/`,
        }}
        segments={[
          isAdmin
            ? {
                label: organism?.maisonMereAAP?.raisonSociale,
                linkProps: {
                  href: `/maison-mere-aap/${maisonMereAAPId}`,
                },
              }
            : {
                label: "Paramètres",
                linkProps: { href: "/agencies-settings-v3" },
              },
          {
            label: "Accompagnement à distance",
            linkProps: {
              href: `/agencies-settings-v3/${maisonMereAAPId}/organisms/${organismId}/remote`,
            },
          },
        ]}
      />
      <h1>Filières, branches et niveaux</h1>
      <FormOptionalFieldsDisclaimer />
      <p>
        Sélectionnez toutes les filières, branches et niveaux gérés par votre
        structure.
      </p>
      <DomainesCcnsDegreesForm
        organismId={organismId}
        backButtonUrl={`/agencies-settings-v3/${maisonMereAAPId}/organisms/${organismId}/remote`}
      />
    </div>
  );
};

export default InformationsRemotePage;
