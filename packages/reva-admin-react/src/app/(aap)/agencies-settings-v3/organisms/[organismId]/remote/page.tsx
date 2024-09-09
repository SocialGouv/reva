"use client";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getRemoteZoneLabel } from "../../../_components/getRemoteZoneLabel";
import { OrganismVisibilityToggle } from "../_components/organism-visibility-toggle/OrganismVisibilityToggle";

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
      managedDegrees {
        id
        degree {
          id
          label
        }
      }
      domaines {
        id
        label
      }
      conventionCollectives {
        id
        label
      }
    }
  }
`);

export default function RemotePage() {
  const { organismId } = useParams<{ organismId: string }>();
  const { graphqlClient } = useGraphQlClient();

  const { data: getOrganismResponse } = useQuery({
    queryKey: [organismId, "organismRemote"],
    queryFn: () => graphqlClient.request(getOrganismQuery, { organismId }),
    enabled: !!organismId,
  });

  const organism = getOrganismResponse?.organism_getOrganism;
  const isDomainAndLevelsComplete =
    organism?.managedDegrees?.[0] &&
    (organism?.domaines?.[0] || organism?.conventionCollectives?.[0]);

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
      <div className="flex flex-col gap-6">
        <EnhancedSectionCard
          title="Informations affichées aux candidats"
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
        <EnhancedSectionCard
          title="Filières, branches et niveaux"
          titleIconClass="fr-icon-award-fill"
          isEditable
          buttonOnClickHref={`/agencies-settings-v3/organisms/${organismId}/remote/domaines-ccns-degrees`}
          status={isDomainAndLevelsComplete ? "COMPLETED" : "TO_COMPLETE"}
        >
          {organism?.domaines?.[0] && (
            <Accordion label="Filières">
              <div className="flex flex-wrap gap-2">
                {organism?.domaines?.map((d) => (
                  <Tag key={d.id}>{d.label}</Tag>
                ))}
              </div>
            </Accordion>
          )}
          {organism?.conventionCollectives?.[0] && (
            <Accordion label="Branches">
              <div className="flex flex-wrap gap-2">
                {organism?.conventionCollectives?.map((ccn) => (
                  <Tag key={ccn.id}>{ccn.label}</Tag>
                ))}
              </div>
            </Accordion>
          )}
          {organism?.managedDegrees?.[0] && (
            <Accordion label="Niveaux">
              <div className="flex flex-wrap gap-2">
                {organism?.managedDegrees?.map((d) => (
                  <Tag key={d.id}>{d.degree.label}</Tag>
                ))}
              </div>
            </Accordion>
          )}
        </EnhancedSectionCard>
        <div className="flex flex-col mt-6">
          <h2>Visibilité de la structure</h2>
          <OrganismVisibilityToggle organismId={organismId} />
        </div>
      </div>
    </div>
  );
}
