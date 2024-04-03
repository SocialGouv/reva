"use client";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { ADMIN_ELM_URL } from "@/config/config";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";

const getCertificationsQuery = graphql(`
  query getCertificationsForCandidate(
    $organismId: UUID
    $offset: Int
    $searchFilter: String
  ) {
    searchCertificationsForCandidate(
      limit: 10
      offset: $offset
      searchText: $searchFilter
      status: AVAILABLE
      organismId: $organismId
    ) {
      rows {
        id
        label
        codeRncp
      }
      info {
        totalRows
        totalPages
        currentPage
      }
    }
  }
`);

const getCandidacyQuery = graphql(`
  query getCandidacyForReorientation($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      organismId
      certification {
        id
        label
        codeRncp
      }
    }
  }
`);

const updateCertificationMutation = graphql(`
  mutation updateCertificationWithinOrganismScope(
    $candidacyId: ID!
    $certificationId: ID!
  ) {
    candidacy_updateCertificationWithinOrganismScope(
      candidacyId: $candidacyId
      certificationId: $certificationId
    ) {
      id
    }
  }
`);

const RECORDS_PER_PAGE = 10;

const ReorientationPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const [searchFilter, setSearchFilter] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const pageParam = params.get("page");

  const currentPage = pageParam ? Number.parseInt(pageParam) : 1;

  const updateSearchFilter = (newSearchFilter: string) => {
    setSearchFilter(newSearchFilter);
    router.push(pathname);
  };

  const { data: getCandidacyResponse } = useQuery({
    queryKey: ["getCandidacy", candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidacyQuery, {
        candidacyId,
      }),
  });

  const candidacy = getCandidacyResponse?.getCandidacyById;
  const organismId = candidacy?.organismId;

  const {
    data: getCertificationsResponse,
    status: getCertificationsQueryStatus,
  } = useQuery({
    queryKey: ["getCertifications", searchFilter, currentPage, organismId],
    queryFn: () =>
      graphqlClient.request(getCertificationsQuery, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        searchFilter,
        organismId,
      }),
    enabled: !!organismId,
  });

  const updateCertification = useMutation({
    mutationFn: ({
      candidacyId,
      certificationId,
    }: {
      candidacyId: string;
      certificationId: string;
    }) =>
      graphqlClient.request(updateCertificationMutation, {
        candidacyId,
        certificationId,
      }),
  });

  const { isFeatureActive } = useFeatureflipping();

  const handleSubmitCertification = async (certificationId: string) => {
    try {
      await updateCertification.mutateAsync({
        candidacyId,
        certificationId,
      });
      successToast("La certification a bien été modifiée.");
      const backUrl = isFeatureActive("NEW_CANDIDACY_SUMMARY_PAGE")
        ? `/candidacies/${candidacyId}/summary`
        : `${ADMIN_ELM_URL}/candidacies/${candidacyId}`;
      router.push(backUrl);
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  const certificationPage =
    getCertificationsResponse?.searchCertificationsForCandidate;

  return (
    certificationPage && (
      <div className="flex flex-col w-full">
        <CandidacyBackButton candidacyId={candidacyId} />
        <h1>Changement de certification</h1>
        <h2 className="text-2xl">Certification sélectionnée</h2>
        <div className="bg-neutral-100 px-6 py-4 rounded-lg mb-8">
          <div className="text-sm text-gray-600">
            {candidacy?.certification?.codeRncp}
          </div>
          <div className="font-semibold text-lg">
            {candidacy?.certification?.label}
          </div>
        </div>
        {getCertificationsQueryStatus === "success" && (
          <SearchList
            title="Certifications disponibles"
            searchFilter={searchFilter}
            searchResultsPage={certificationPage}
            updateSearchFilter={updateSearchFilter}
          >
            {(c) => (
              <div
                key={c.id}
                className="flex items-end justify-between border-b pb-6 px-4"
              >
                <div>
                  <div className="text-gray-500 text-sm">{c.codeRncp}</div>
                  <div className="text-lg font-bold">{c.label}</div>
                </div>
                <Button
                  className="mt-2 ml-auto"
                  priority="tertiary"
                  onClick={() => handleSubmitCertification(c.id)}
                >
                  Choisir
                </Button>
              </div>
            )}
          </SearchList>
        )}
      </div>
    )
  );
};

export default ReorientationPage;
