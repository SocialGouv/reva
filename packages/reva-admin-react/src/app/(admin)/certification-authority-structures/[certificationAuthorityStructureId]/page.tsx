"use client";

import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCertificationAuthorityStructure = graphql(`
  query getCertificationAuthorityStructureForAdminPage($id: ID!) {
    certification_authority_getCertificationAuthorityStructure(id: $id) {
      id
      label
      certifications {
        id
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
            </DefaultCandidacySectionCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationAuthorityStructurePage;
