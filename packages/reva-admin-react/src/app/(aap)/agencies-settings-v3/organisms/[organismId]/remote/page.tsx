"use client";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getRemoteZoneLabel } from "../../../_components/getRemoteZoneLabel";

const getOrganismQuery = graphql(`
  query getOrganismForOrganismRemotePage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      informationsCommerciales {
        id
        nom
        telephone
        siteInternet
        emailContact
      }
      remoteZones
    }
  }
`);

export default function RemotePage() {
  const { organismId } = useParams<{ organismId: string }>();
  const { graphqlClient } = useGraphQlClient();

  const { data: getOrganismResponse, status: getOrganismStatus } = useQuery({
    queryKey: ["organisms", "agencies-settings-layout-page-v2"],
    queryFn: () => graphqlClient.request(getOrganismQuery, { organismId }),
    enabled: !!organismId,
  });

  const organism = getOrganismResponse?.organism_getOrganism;

  return (
    <div className="flex flex-col w-full">
      <Breadcrumb
        currentPageLabel={"Accompagnement à distance"}
        homeLinkProps={{
          href: `/`,
        }}
        segments={[
          {
            label: "Paramètres",
            linkProps: { href: "/agencies-settings-v3" },
          },
        ]}
      />

      <h1>Accompagnement à distance</h1>
      <p>
        Pour être visible complétez tout et mettez l’interrupteur sur visible.
      </p>
      <EnhancedSectionCard
        title="Informations affichées au candidat"
        titleIconClass="fr-icon-information-fill"
        isEditable
        buttonOnClickHref={`/agencies-settings-v3/organisms/${organismId}/remote/information`}
      >
        <div className="flex flex-col gap-2">
          <div className="font-bold">
            {organism?.informationsCommerciales?.nom}
          </div>
          <div>
            {organism?.informationsCommerciales?.telephone}{" "}
            {organism?.informationsCommerciales?.emailContact}
          </div>
          {organism?.informationsCommerciales?.siteInternet && (
            <Link
              className="fr-link mr-auto"
              target="_blank"
              href={organism?.informationsCommerciales?.siteInternet}
            >
              Site internet
            </Link>
          )}
          <ul className="list-none pl-0">
            {organism?.remoteZones.map((r) => (
              <li key={r}>{getRemoteZoneLabel(r)}</li>
            ))}
          </ul>
        </div>
      </EnhancedSectionCard>
    </div>
  );
}
