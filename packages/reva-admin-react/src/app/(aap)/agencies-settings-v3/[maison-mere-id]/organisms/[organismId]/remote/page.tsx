"use client";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useAuth } from "@/components/auth/auth";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

import { getRemoteZoneLabel } from "../../../../_components/getRemoteZoneLabel";
import { OrganismVisibilityToggle } from "../_components/organism-visibility-toggle/OrganismVisibilityToggle";

const getOrganismQuery = graphql(`
  query getOrganismForOrganismRemotePage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      maisonMereAAP {
        raisonSociale
      }
      id
      nomPublic
      telephone
      siteInternet
      emailContact
      remoteZones
      modaliteAccompagnementRenseigneeEtValide
      managedDegrees {
        id
        degree {
          id
          level
        }
      }
      formacodes {
        code
        label
      }
      conventionCollectives {
        id
        label
      }
      certifications {
        id
        codeRncp
        label
      }
    }
  }
`);

export default function RemotePage() {
  const { organismId, "maison-mere-id": maisonMereAAPId } = useParams<{
    organismId: string;
    "maison-mere-id": string;
  }>();
  const { graphqlClient } = useGraphQlClient();

  const { data: getOrganismResponse } = useQuery({
    queryKey: [organismId, "organismRemote"],
    queryFn: () => graphqlClient.request(getOrganismQuery, { organismId }),
    enabled: !!organismId,
  });
  const { isAdmin } = useAuth();

  const organism = getOrganismResponse?.organism_getOrganism;

  const isFormacodesAndLevelsComplete =
    organism?.managedDegrees?.[0] &&
    (organism?.formacodes?.[0] || organism?.conventionCollectives?.[0]);

  return (
    <div className="flex flex-col w-full">
      <Breadcrumb
        currentPageLabel={"Accompagnement à distance"}
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
        ]}
      />

      <h1>Accompagnement à distance</h1>
      <p>
        Complétez et/ou modifiez les modalités d’accompagnement à distance ainsi
        que les domaines, branches et niveaux. Si vous le souhaitez, vous pouvez
        aussi rendre l’accompagnement à distance invisible dans les résultats de
        recherche des candidats.
      </p>
      <Alert
        className="mt-6 mb-8"
        severity="warning"
        small
        title="Ces modifications seront appliquées à tous les collaborateurs proposant des accompagnements à distance."
        description=""
      />
      <div className="flex flex-col gap-6">
        <EnhancedSectionCard
          title="Informations affichées aux candidats"
          titleIconClass="fr-icon-information-fill"
          isEditable
          status={
            organism?.modaliteAccompagnementRenseigneeEtValide
              ? "COMPLETED"
              : "TO_COMPLETE"
          }
          buttonOnClickHref={`/agencies-settings-v3/${maisonMereAAPId}/organisms/${organismId}/remote/information`}
        >
          <div className="flex flex-col gap-2">
            <div className="font-bold">{organism?.nomPublic}</div>
            <div>
              {organism?.telephone} {organism?.emailContact}
            </div>
            {organism?.siteInternet && (
              <Link
                className="fr-link mr-auto"
                target="_blank"
                href={organism?.siteInternet}
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
          title="Domaines, branches, niveaux et certifications"
          titleIconClass="fr-icon-award-fill"
          isEditable
          buttonOnClickHref={`/agencies-settings-v3/${maisonMereAAPId}/organisms/${organismId}/remote/formacodes-ccns-degrees`}
          status={isFormacodesAndLevelsComplete ? "COMPLETED" : "TO_COMPLETE"}
        >
          {organism?.formacodes?.[0] && (
            <Accordion label="Domaines" defaultExpanded>
              <div className="flex flex-wrap gap-2">
                {organism?.formacodes?.map((formacode) => (
                  <Tag key={formacode.code}>
                    {`${formacode.code} ${formacode.label}`}
                  </Tag>
                ))}
              </div>
            </Accordion>
          )}
          {organism?.conventionCollectives?.[0] && (
            <Accordion label="Branches" defaultExpanded>
              <div className="flex flex-wrap gap-2">
                {organism?.conventionCollectives?.map((ccn) => (
                  <Tag key={ccn.id}>{ccn.label}</Tag>
                ))}
              </div>
            </Accordion>
          )}
          {organism?.managedDegrees?.[0] && (
            <Accordion label="Niveaux" defaultExpanded>
              <div className="flex flex-wrap gap-2">
                {organism?.managedDegrees?.map((d) => (
                  <Tag key={d.id}>Niveau {d.degree.level}</Tag>
                ))}
              </div>
            </Accordion>
          )}
          {organism?.certifications?.[0] && (
            <Accordion label="Certifications" defaultExpanded>
              <div className="flex flex-col">
                {organism.certifications?.map((certification) => (
                  <Link
                    key={certification.id}
                    href={`/certification-details/${certification.id}`}
                    target="_blank"
                    className="py-2 text-sm bg-none text-dsfr-blue-france-sun-113 border-dsfr-light-decisions-border-border-default-grey border-b last:border-none"
                  >{`${certification.codeRncp} - ${certification.label}`}</Link>
                ))}
              </div>
            </Accordion>
          )}
        </EnhancedSectionCard>
        <div className="flex flex-col mt-6">
          <OrganismVisibilityToggle organismId={organismId} />
        </div>
      </div>
    </div>
  );
}
