"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getBlocDeCompetencesQuery = graphql(`
  query getBlocDeCompetencesForCompetenciesBlockPage(
    $candidacyId: ID!
    $blocDeCompetencesId: ID!
  ) {
    getCandidacyById(id: $candidacyId) {
      dematerializedFeasibilityFile {
        blocsDeCompetences(blocDeCompetencesId: $blocDeCompetencesId) {
          id
          code
          label
        }
      }
    }
  }
`);

const CompetenciesBlockPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId, blocDeCompetencesId } = useParams<{
    candidacyId: string;
    blocDeCompetencesId: string;
  }>();

  const { data: getBlocDeCompetencesResponse } = useQuery({
    queryKey: [candidacyId, "getBlocDeCompetencesForCompetenciesBlockPage"],
    queryFn: () =>
      graphqlClient.request(getBlocDeCompetencesQuery, {
        candidacyId,
        blocDeCompetencesId,
      }),
  });

  const block =
    getBlocDeCompetencesResponse?.getCandidacyById
      ?.dematerializedFeasibilityFile?.blocsDeCompetences?.[0];

  return (
    <div className="flex flex-col">
      <h1>Blocs de compétences</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl">
        Détailler l’activité et le niveau d’autonomie et/ou de responsabilité du
        candidat, et donner des exemples d’outils, méthodes, supports utilisés
      </p>
      {block && (
        <>
          <h2 className="mb-0">{block.code}</h2>
          <p className="text-lg font-medium">{block.label}</p>
        </>
      )}
    </div>
  );
};

export default CompetenciesBlockPage;
