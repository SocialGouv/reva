"use client";

import CandidacySectionCard from "@/components/card/candidacy-section-card/CandidacySectionCard";
import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo } from "react";

const getCertificationAuthorityStructure = graphql(`
  query getCertificationAuthorityStructureForAdminPage($id: ID!) {
    certification_authority_getCertificationAuthorityStructure(id: $id) {
      id
      label
      certifications {
        id
        codeRncp
        label
        domaines {
          id
          label
        }
      }
      certificationAuthorities {
        id
        label
        certificationAuthorityLocalAccounts {
          id
          account {
            firstname
            lastname
            email
          }
        }
      }
    }
  }
`);

const CertificationAuthorityStructurePage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { certificationAuthorityStructureId } = useParams<{
    certificationAuthorityStructureId: string;
  }>();

  const {
    data: getCertificationAuthorityStructureResponse,
    status: getCertificationAuthorityStructureStatus,
  } = useQuery({
    queryKey: [
      certificationAuthorityStructureId,
      "getCertificationAuthorityStructure",
      "getCertificationAuthorityStructureAdminListPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityStructure, {
        id: certificationAuthorityStructureId,
      }),
  });

  const certificationAuthorityStructure =
    getCertificationAuthorityStructureResponse?.certification_authority_getCertificationAuthorityStructure;

  const domainsAndCertifications = useMemo(
    () =>
      certificationAuthorityStructure?.certifications?.reduce(
        (acc, curr) => {
          if (acc[curr.domaines[0].id]) {
            acc[curr.domaines[0].id] = [...acc[curr.domaines[0].id], curr];
          } else {
            acc[curr.domaines[0].id] = [curr];
          }
          return acc;
        },
        {} as Record<
          string,
          (typeof certificationAuthorityStructure.certifications)[0][]
        >,
      ) || {},
    [certificationAuthorityStructure],
  );

  if (getCertificationAuthorityStructureStatus !== "success") {
    return null;
  }

  return (
    <div className="flex flex-col flex-1">
      {certificationAuthorityStructure && (
        <div className="flex flex-col">
          <h1>{certificationAuthorityStructure.label}</h1>
          <p className="text-xl">
            Retrouvez les informations liées à la structure certificatrice. Vous
            devez ajouter le certificateur administrateur et le responsable du
            référentiel depuis cet espace.
          </p>
          <div className="flex flex-col gap-6">
            <DefaultCandidacySectionCard
              title="Informations générales"
              titleIconClass="fr-icon-information-fill"
              isEditable
              status="COMPLETED"
              buttonOnClickHref={`/certification-authority-structures/${certificationAuthorityStructureId}/informations-generales`}
            >
              <p className="ml-10 mb-0 font-bold">
                {certificationAuthorityStructure.label}
              </p>
            </DefaultCandidacySectionCard>
            <DefaultCandidacySectionCard
              title="Certifications gérées"
              titleIconClass="fr-icon-award-fill"
              isEditable
              status={
                certificationAuthorityStructure.certifications.length
                  ? "COMPLETED"
                  : "TO_COMPLETE"
              }
              buttonOnClickHref={`/certification-authority-structures/${certificationAuthorityStructureId}/certifications`}
            >
              {certificationAuthorityStructure.certifications.length ? (
                <div className="flex flex-col gap-6">
                  <Badge className="bg-[#FEE7FC] text-[#6E445A]">
                    {certificationAuthorityStructure.certifications.length}{" "}
                    certifications gérées
                  </Badge>
                </div>
              ) : null}
              <p className="font-bold mt-6">Domaines rattachés</p>
              {Object.entries(domainsAndCertifications).map(
                ([domainId, certifications]) => (
                  <Accordion
                    label={certifications[0].domaines[0].label}
                    key={domainId}
                  >
                    <div className="flex flex-wrap gap-2">
                      {certifications.map((c) => (
                        <Tag key={c.id}>
                          {c.codeRncp} - {c.label}
                        </Tag>
                      ))}
                    </div>
                  </Accordion>
                ),
              )}
            </DefaultCandidacySectionCard>
            <CandidacySectionCard
              title="Certificateurs administrateurs"
              titleIconClass="fr-icon-clipboard-fill"
            >
              <ul className="list-none font-bold">
                {certificationAuthorityStructure.certificationAuthorities.map(
                  (certificationAuthority) => (
                    <li
                      key={certificationAuthority.id}
                      className="flex items-center justify-between pt-4 pb-3 border-neutral-300 border-t last:border-b"
                    >
                      <span>{certificationAuthority.label}</span>
                      <span>
                        <Button
                          priority="tertiary"
                          linkProps={{
                            href: `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthority.id}`,
                          }}
                        >
                          Modifier
                        </Button>
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </CandidacySectionCard>
            <CandidacySectionCard
              title="Comptes collaborateurs"
              titleIconClass="fr-icon-team-fill"
            >
              <ul className="list-none">
                {certificationAuthorityStructure.certificationAuthorities
                  .filter((ca) => ca.certificationAuthorityLocalAccounts.length)
                  .map((certificationAuthority) => (
                    <li key={certificationAuthority.id}>
                      <Accordion
                        label={certificationAuthority.label}
                        className="before:shadow-none"
                      >
                        {certificationAuthority.certificationAuthorityLocalAccounts.map(
                          (cala) => (
                            <li
                              key={cala.id}
                              className="flex items-center justify-between pt-4 pb-3 border-neutral-300 first:border-t border-b"
                            >
                              <div className="flex flex-col">
                                <span className="font-bold">
                                  {cala.account.firstname || ""}{" "}
                                  {cala.account.lastname}
                                </span>
                                <span>{cala.account.email}</span>
                              </div>
                              <span>
                                <Button
                                  priority="tertiary"
                                  linkProps={{
                                    href: `/certification-authority-structures/${certificationAuthorityStructureId}/comptes-collaborateurs/${cala.id}`,
                                  }}
                                >
                                  Visualiser
                                </Button>
                              </span>
                            </li>
                          ),
                        )}
                      </Accordion>
                    </li>
                  ))}
              </ul>
            </CandidacySectionCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationAuthorityStructurePage;
