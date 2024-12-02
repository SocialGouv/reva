"use client";

import ResponsableReferentielCard from "@/app/(admin)/certification-authority-structures/[certificationAuthorityStructureId]/_components/responsable-referentiel-card/ResponsableReferentielCard";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { SectionCard } from "@/components/card/section-card/SectionCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { CertificationsSummaryCard } from "./_components/certifications-summary-card/CertificationsSummaryCard";

const getCertificationAuthorityStructure = graphql(`
  query getCertificationAuthorityStructureForAdminPage($id: ID!) {
    certification_authority_getCertificationAuthorityStructure(id: $id) {
      id
      label
      certifications {
        id
        codeRncp
        label
        conventionsCollectives {
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
      certificationRegistryManager {
        id
        account {
          firstname
          lastname
          email
        }
      }
    }
  }
`);

const CertificationAuthorityStructurePage = () => {
  const { graphqlClient } = useGraphQlClient();
  const router = useRouter();

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
            devez ajouter le gestionnaire des candidatures et le responsable du
            référentiel depuis cet espace.
          </p>
          <div className="flex flex-col gap-6">
            <EnhancedSectionCard
              title="Informations générales"
              titleIconClass="fr-icon-information-fill"
              isEditable
              status="COMPLETED"
              buttonOnClickHref={`/certification-authority-structures/${certificationAuthorityStructureId}/informations-generales`}
            >
              <p className="ml-10 mb-0 font-bold">
                {certificationAuthorityStructure.label}
              </p>
            </EnhancedSectionCard>
            <CertificationsSummaryCard
              certifications={certificationAuthorityStructure.certifications}
              updateButtonHref={`/certification-authority-structures/${certificationAuthorityStructureId}/certifications`}
            />
            <ResponsableReferentielCard
              certificationAuthorityStructureId={
                certificationAuthorityStructureId
              }
              certificationRegistryManager={
                certificationAuthorityStructure.certificationRegistryManager
              }
            />
            <SectionCard
              title="Gestionnaire des candidatures"
              titleIconClass="fr-icon-clipboard-fill"
              buttonPriority="primary"
              buttonTitle="Ajouter un compte"
              hasButton
              buttonOnClick={() =>
                router.push(
                  `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/create`,
                )
              }
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
                          priority="tertiary no outline"
                          size="small"
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
            </SectionCard>
            <SectionCard
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
                                  priority="tertiary no outline"
                                  size="small"
                                  linkProps={{
                                    href: `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthority.id}/comptes-collaborateurs/${cala.id}`,
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
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationAuthorityStructurePage;
