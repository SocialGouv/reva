"use client";

import { useCallback, useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";

import Button from "@codegouvfr/react-dsfr/Button";

import { Organism } from "@/graphql/generated/graphql";

import { PageLayout } from "@/layouts/page.layout";

import { useCandidacy } from "@/components/candidacy/candidacyContext";

import { SearchBar } from "@/components/legacy/molecules/SearchBar/SearchBar";
import { OrganismCard } from "@/components/legacy/organisms/OrganismCard/OrganismCard";
import { OrganismFilters } from "@/components/legacy/organisms/OrganismFilters/OrganismFilters";

import { useSetOrganism } from "./set-organism.hooks";

const RECORDS_PER_PAGE = 10;

interface State {
  rows: Organism[];
  offset: number;
  hasMore: boolean;
}

export default function SetOrganism() {
  const router = useRouter();

  const { canEditCandidacy, candidate, candidacy, refetch } = useCandidacy();

  const [organismSearchText, setOrganismSearchText] = useState<string>("");
  const [organismSearchOnsite, setOrganismSearchOnsite] =
    useState<boolean>(false);
  const [organismSearchRemote, setOrganismSearchRemote] =
    useState<boolean>(false);
  const [organismSearchZip, setOrganismSearchZip] = useState<
    string | undefined
  >();
  const [organismSearchPmr, setOrganismSearchPmr] = useState<boolean>(false);

  const { getRandomOrganismsForCandidacy, selectOrganism } = useSetOrganism({
    candidacyId: candidacy.id || "",
    departmentId: candidate?.department.id || "",
    searchText: organismSearchText,
    searchFilter: {
      distanceStatus: organismSearchOnsite
        ? "ONSITE"
        : organismSearchRemote
          ? "REMOTE"
          : undefined,
      pmr: organismSearchPmr,
      zip: organismSearchZip,
    },
  });

  const organisms =
    getRandomOrganismsForCandidacy.data?.getRandomOrganismsForCandidacy;

  const [state, setState] = useState<State>({
    rows: [],
    offset: 0,
    hasMore: false,
  });

  if (!canEditCandidacy) {
    redirect("/");
  }

  const { offset: stateOffset } = state;

  const loadOrganisms = useCallback(
    (offset: number) => {
      const rows = (organisms?.rows || []).slice(0, offset);

      setState({
        rows: rows as Organism[],
        offset,
        hasMore: rows.length < (organisms?.rows || []).length,
      });
    },
    [organisms?.rows],
  );

  useEffect(() => {
    loadOrganisms(RECORDS_PER_PAGE);
  }, [loadOrganisms]);

  const submitOrganism = async (organismId: string) => {
    try {
      const response = await selectOrganism.mutateAsync({
        candidacyId: candidate.candidacy.id,
        organismId,
      });
      if (response) {
        refetch();
        router.push("/");
      }
    } catch (error) {}
  };

  return (
    <PageLayout
      title="Choix du diplôme"
      data-test={`certificates`}
      displayBackToHome
    >
      <h2 className="mt-6 mb-2">Choisissez votre accompagnateur</h2>

      <div className="mt-6 lg:mb-14 lg:px-10 pb-10 lg:py-8 lg:shadow-lifted border-b lg:border-b-4 lg:border-[#FFA180]">
        <h3>Recherchez par nom</h3>
        <SearchBar
          label="Recherchez votre organisme d’accompagnement en saisissant son nom"
          searchFilter={organismSearchText}
          onSearchFilterChange={setOrganismSearchText}
          className="mt-6"
        />
      </div>
      <div className="lg:flex gap-x-6">
        <div className="lg:w-1/3">
          <OrganismFilters
            onSearch={(filters) => {
              setOrganismSearchOnsite(filters.organismSearchOnsite);
              setOrganismSearchRemote(filters.organismSearchRemote);
              setOrganismSearchZip(filters.organismSearchZip);
              setOrganismSearchPmr(filters.organismSearchPmr);
            }}
            filters={{
              organismSearchText,
              organismSearchRemote,
              organismSearchOnsite,
              organismSearchZip,
              organismSearchPmr,
            }}
          />
        </div>
        <div className="lg:w-2/3">
          {organisms && (
            <>
              {organisms.totalRows > 0 ? (
                <p className="mt-3 mb-4 text-gray-500">
                  {organisms.totalRows === 1
                    ? `Résultat filtré : ${organisms.totalRows} accompagnateur`
                    : `Résultats filtrés : ${organisms.totalRows} accompagnateurs`}
                </p>
              ) : (
                <div className="min-h-80 h-full flex flex-col items-center justify-center">
                  <h3 className="text-2xl font-bold mb-4">Pas de résultats</h3>
                  <p className="text-lg max-w-md text-center leading-relaxed">
                    Nous ne trouvons pas d’accompagnateurs sur votre diplôme
                    avec les critères sélectionnés.
                  </p>
                </div>
              )}
            </>
          )}
          <Organisms
            submitOrganism={({ organismId }) => {
              submitOrganism(organismId);
            }}
            availableOrganisms={{
              rows: state.rows,
              totalRows: organisms?.totalRows || 0,
            }}
          />
          <div className="mt-6 w-full flex flex-row items-center justify-center">
            {state.hasMore ? (
              <Button
                data-test="project-organisms-refresh-organisms"
                priority="secondary"
                nativeButtonProps={{
                  onClick: () => {
                    const nextOffset = stateOffset + RECORDS_PER_PAGE;
                    loadOrganisms(nextOffset);
                  },
                }}
              >
                Afficher plus d’organismes
              </Button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

interface PropsOrganisms {
  submitOrganism: ({ organismId }: { organismId: string }) => void;
  availableOrganisms?: { rows: Organism[]; totalRows: number };
}

const Organisms: React.FC<PropsOrganisms> = ({
  submitOrganism,
  availableOrganisms = { rows: [], totalRows: 0 },
}) => {
  const OrganismGroup = ({
    indexPredicate,
  }: {
    indexPredicate: (index: number) => boolean;
  }) => {
    return (
      <>
        {availableOrganisms.rows
          .filter((_, index) => indexPredicate(index))
          .map((organism) => {
            return (
              <OrganismCard
                key={organism.id}
                organism={organism}
                onClick={() => submitOrganism({ organismId: organism.id })}
              />
            );
          })}
      </>
    );
  };

  return (
    <div className="flex flex-row gap-4 max-w-3xl">
      <div className="md:columns-1 w-[50%] space-y-4">
        {<OrganismGroup indexPredicate={(i) => i % 2 === 0} />}
      </div>
      <div className="md:columns-1 w-[50%] space-y-4">
        {<OrganismGroup indexPredicate={(i) => i % 2 === 1} />}
      </div>
    </div>
  );
};
