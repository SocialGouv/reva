"use client";

import { OrganismCard } from "./_components/OrganismCard/OrganismCard";
import { OrganismThumb } from "./_components/OrganismThumb/OrganismThumb.component";

import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SearchList } from "@/components/search/search-list/SearchList";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { graphql } from "@/graphql/generated";

const modal = createModal({
  id: "confirm-changement-aap",
  isOpenedByDefault: false,
});

const searchOrganismsForCandidacyAsAdminQuery = graphql(`
  query candidacy_searchOrganismsForCandidacyAsAdmin(
    $candidacyId: UUID!
    $offset: Int
    $searchText: String
  ) {
    candidacy_searchOrganismsForCandidacyAsAdmin(
      candidacyId: $candidacyId
      limit: 10
      offset: $offset
      searchText: $searchText
    ) {
      rows {
        id
        label
        contactAdministrativeEmail
        contactAdministrativePhone
        modaliteAccompagnement
        website
        distanceKm
        isMaisonMereMCFCompatible
        nomPublic
        telephone
        siteInternet
        emailContact
        adresseNumeroEtNomDeRue
        adresseInformationsComplementaires
        adresseCodePostal
        adresseVille
        conformeNormesAccessibilite
      }
      info {
        totalRows
        totalPages
        currentPage
      }
    }
  }
`);

const selectOrganismForCandidacyAsAdminMutation = graphql(`
  mutation candidacy_selectOrganismAsAdmin(
    $candidacyId: UUID!
    $organismId: UUID!
  ) {
    candidacy_selectOrganismAsAdmin(
      candidacyId: $candidacyId
      organismId: $organismId
    ) {
      id
    }
  }
`);

const getCandidacyQuery = graphql(`
  query getCandidacyForChangementAap($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      organism {
        id
        label
        nomPublic
        contactAdministrativeEmail
        contactAdministrativePhone
        emailContact
        telephone
        siteInternet
        website
      }
    }
  }
`);

const RECORDS_PER_PAGE = 10;

const ReorientationPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const router = useRouter();

  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const searchFilter = searchParams.get("search") || "";

  const queryClient = useQueryClient();

  const { data: getCandidacyResponse } = useQuery({
    queryKey: ["getCandidacy", candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidacyQuery, {
        candidacyId,
      }),
  });

  const currentOrganism = getCandidacyResponse?.getCandidacyById?.organism;

  const { data: getOrganismsResponse, status: getOrganismsQueryStatus } =
    useQuery({
      queryKey: ["getOrganisms", searchFilter, currentPage],
      queryFn: () =>
        graphqlClient.request(searchOrganismsForCandidacyAsAdminQuery, {
          offset: (currentPage - 1) * RECORDS_PER_PAGE,
          searchText: searchFilter,
          candidacyId,
        }),
    });

  const updateOrganism = useMutation({
    mutationFn: ({
      candidacyId,
      organismId,
    }: {
      candidacyId: string;
      organismId: string;
    }) =>
      graphqlClient.request(selectOrganismForCandidacyAsAdminMutation, {
        candidacyId,
        organismId,
      }),
  });

  const handleSubmitOrganism = async (organismId: string) => {
    try {
      await updateOrganism.mutateAsync({
        candidacyId,
        organismId,
      });
      successToast("L'AAP a bien été modifié.");
      queryClient.invalidateQueries({ queryKey: [candidacyId] });

      const backUrl = `/candidacies/${candidacyId}/summary`;
      router.push(backUrl);
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  const organismPage =
    getOrganismsResponse?.candidacy_searchOrganismsForCandidacyAsAdmin;

  const [selectedOrganismId, setSelectedOrganismId] = useState<
    string | undefined
  >();

  const selectedOrganism = organismPage?.rows.find(
    (c) => c.id == selectedOrganismId,
  );

  return (
    organismPage && (
      <div className="flex flex-col w-full">
        <CandidacyBackButton candidacyId={candidacyId} />
        <h1>Changement de l'AAP</h1>
        <p>
          Vous pouvez changer l'AAP du candidat à tout moment si la candidature
          est hors financement.
        </p>
        <div className="mb-12">
          <label className="text-xs font-bold py-2">
            AAP choisie par le candidat
          </label>

          <OrganismThumb
            label={currentOrganism?.nomPublic || currentOrganism?.label}
            email={
              currentOrganism?.emailContact ||
              currentOrganism?.contactAdministrativeEmail
            }
            phone={
              currentOrganism?.telephone ||
              currentOrganism?.contactAdministrativePhone
            }
            website={currentOrganism?.siteInternet || currentOrganism?.website}
          />
        </div>
        {getOrganismsQueryStatus === "success" && (
          <>
            <SearchList
              hint={() => (
                <label className="mb-2">{`Recherchez parmi les AAP`}</label>
              )}
              searchFilter={searchFilter}
              searchResultsPage={organismPage}
            >
              {(organism) => (
                <OrganismCard
                  key={organism.id}
                  organism={organism}
                  onClick={() => {
                    setSelectedOrganismId(organism.id);
                    modal.open();
                  }}
                />
              )}
            </SearchList>

            {organismPage.rows.length == 0 && <NoResult />}
          </>
        )}

        <>
          <modal.Component
            title="Changement de l'AAP"
            className="modal-confirm-changement-aap"
            size="large"
            buttons={[
              {
                priority: "secondary",
                children: "Annuler",
              },
              {
                priority: "primary",
                onClick: () => {
                  if (selectedOrganismId) {
                    handleSubmitOrganism(selectedOrganismId);
                  }
                },
                children: "Enregistrer",
              },
            ]}
          >
            <div className="flex flex-col gap-4">
              <p>
                Vous vous apprêtez à changer l'AAP du candidat. Celui-ci sera
                effectif si vous enregistrez ce choix. Souhaitez-vous continuer
                ?
              </p>

              <div className="flex flex-row justify-between items-center gap-4">
                <div className="flex-1">
                  <OrganismThumb
                    label={currentOrganism?.nomPublic || currentOrganism?.label}
                    email={
                      currentOrganism?.emailContact ||
                      currentOrganism?.contactAdministrativeEmail
                    }
                    phone={
                      currentOrganism?.telephone ||
                      currentOrganism?.contactAdministrativePhone
                    }
                    website={
                      currentOrganism?.siteInternet || currentOrganism?.website
                    }
                  />
                </div>

                <div>
                  <span
                    className="fr-icon-arrow-right-line"
                    aria-hidden="true"
                  ></span>
                </div>

                <div className="flex-1">
                  <OrganismThumb
                    label={
                      selectedOrganism?.nomPublic || selectedOrganism?.label
                    }
                    email={
                      selectedOrganism?.emailContact ||
                      selectedOrganism?.contactAdministrativeEmail
                    }
                    phone={
                      selectedOrganism?.telephone ||
                      selectedOrganism?.contactAdministrativePhone
                    }
                    website={
                      selectedOrganism?.siteInternet ||
                      selectedOrganism?.website
                    }
                  />
                </div>
              </div>
            </div>
          </modal.Component>
        </>
      </div>
    )
  );
};

const NoResult = () => {
  return (
    <div className="flex flex-col items-center gap-6">
      <Image
        className=""
        width="207"
        height="235"
        src="/admin2/components/no-result.svg"
        alt="Pas de résultat"
      />

      <h3 className="mb-0">Aucun résultat trouvé</h3>
      <p className="text-center">
        {`Vérifiez l’orthographe ou l'AAP recherché. Il s’agit
        peut-être d’un AAP qui n'est pas positionné sur le même domaine que la certification choisie par le candidat.`}
        <br />
        <br />
      </p>
    </div>
  );
};

export default ReorientationPage;
