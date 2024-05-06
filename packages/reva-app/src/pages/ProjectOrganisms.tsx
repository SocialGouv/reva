import { Button } from "@codegouvfr/react-dsfr/Button";
import { useActor } from "@xstate/react";
import { ErrorAlertFromState } from "components/molecules/ErrorAlertFromState/ErrorAlertFromState";
import { SearchBar } from "components/molecules/SearchBar/SearchBar";
import { FC, useEffect, useState } from "react";
import { Interpreter } from "xstate";

import { BackToHomeButton } from "../components/molecules/BackToHomeButton/BackToHomeButton";
import { OrganismCard } from "../components/organisms/OrganismCard/OrganismCard";
import { OrganismFilters } from "../components/organisms/OrganismFilters/OrganismFilters";
import { Page } from "../components/organisms/Page";
import { Department, Organism } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface PropsOrganisms {
  submitOrganism: ({ organismId }: { organismId: string }) => void;
  availableOrganisms?: { rows: Organism[]; totalRows: number };
  selectedDepartment?: Department;
}

const Organisms: FC<PropsOrganisms> = ({
  submitOrganism,
  availableOrganisms = { rows: [], totalRows: 0 },
  selectedDepartment,
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
                department={selectedDepartment}
                onClick={() => submitOrganism({ organismId: organism.id })}
              />
            );
          })}
      </>
    );
  };

  return (
    <div className="md:columns-2 space-y-4 gap-4 max-w-3xl">
      {<OrganismGroup indexPredicate={(i) => i % 2 === 0} />}
      {<OrganismGroup indexPredicate={(i) => i % 2 === 1} />}
    </div>
  );
};

interface Props {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

interface State {
  rows: Organism[];
  offset: number;
  hasMore: boolean;
}

export const ProjectOrganisms: FC<Props> = ({ mainService }) => {
  const [xstate, send] = useActor(mainService);
  const {
    selectedDepartment,
    organisms,
    candidacyId,
    organismSearchText,
    organismSearchOnsite,
    organismSearchRemote,
    activeFeatures,
    organismSearchZip,
    organismSearchPmr,
  } = xstate.context;

  const [searchText, setSearchText] = useState(organismSearchText);
  const [state, setState] = useState<State>({
    rows: [],
    offset: 0,
    hasMore: false,
  });

  const loadOrganisms = (offset?: number) => {
    const { offset: stateOffset } = state;

    const nextOffset = (offset !== undefined ? offset : stateOffset) + 10;
    const rows = organisms?.rows.slice(0, nextOffset) || [];

    setState({
      ...state,
      rows,
      offset: nextOffset,
      hasMore: rows.length < (organisms?.rows || []).length,
    });
  };

  useEffect(() => {
    send({ type: "CLEAR_ORGANISM_SEARCH" });
  }, [send]);

  useEffect(() => {
    setSearchText(organismSearchText);
  }, [organismSearchText]);

  useEffect(() => {
    loadOrganisms(0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organisms]);

  if (!candidacyId) return <p>Aucun Id de candidat trouvé</p>;

  return (
    <>
      <Page title="Votre organisme d'accompagnement">
        <BackToHomeButton />
        <ErrorAlertFromState />
        <h1 className="mt-6">Choisissez votre accompagnateur</h1>
        <div className="mt-6 lg:mb-14 lg:px-10 pb-10 lg:py-8 lg:shadow-lifted border-b lg:border-b-4 lg:border-[#FFA180]">
          <h2>Recherchez par nom</h2>
          <SearchBar
            label="Recherchez votre organisme d’accompagnement en saisissant son nom"
            value={searchText}
            setValue={setSearchText}
            onSubmit={() => {
              send({
                type: "SET_ORGANISM_SEARCH",
                organismSearchText: searchText,
                organismSearchOnsite,
                organismSearchRemote,
                organismSearchZip,
                organismSearchPmr,
              });
            }}
            className="mt-6"
          />
        </div>
        <div className="lg:flex gap-x-6">
          <div className="lg:w-1/3">
            <OrganismFilters
              onSearch={(filters) =>
                send({
                  ...filters,
                  type: "SET_ORGANISM_SEARCH",
                })
              }
              filters={{
                organismSearchText,
                organismSearchRemote,
                organismSearchOnsite,
                organismSearchZip,
                organismSearchPmr,
              }}
              filterDistanceIsActive={activeFeatures.includes(
                "CANDIDATE_APP_FILTER_DISTANCE",
              )}
            />
          </div>
          <div className="lg:w-2/3">
            {selectedDepartment && organisms && (
              <>
                {organisms.totalRows > 0 ? (
                  <p className="mt-3 mb-4 text-gray-500">
                    {organisms.totalRows === 1
                      ? `Résultat filtré : ${organisms.totalRows} accompagnateur`
                      : `Résultats filtrés : ${organisms.totalRows} accompagnateurs`}
                  </p>
                ) : (
                  <div className="min-h-80 h-full flex flex-col items-center justify-center">
                    <h3 className="text-2xl font-bold mb-4">
                      Pas de résultats
                    </h3>
                    <p className="text-lg max-w-md text-center leading-relaxed">
                      Nous ne trouvons pas d’accompagnateurs sur votre diplôme
                      avec les critères sélectionnés.
                    </p>
                  </div>
                )}
              </>
            )}
            <Organisms
              submitOrganism={({ organismId }) =>
                send({
                  type: "SUBMIT_ORGANISM",
                  organism: {
                    candidacyId,
                    selectedOrganismId: organismId,
                  },
                })
              }
              availableOrganisms={{
                rows: state.rows,
                totalRows: organisms?.totalRows || 0,
              }}
              selectedDepartment={selectedDepartment}
            />
            <div className="mt-6 w-full flex flex-row items-center justify-center">
              {state.hasMore ? (
                <Button
                  data-test="project-organisms-refresh-organisms"
                  priority="secondary"
                  nativeButtonProps={{
                    onClick: () => {
                      loadOrganisms();
                    },
                  }}
                >
                  Afficher plus d'organismes
                </Button>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </Page>
    </>
  );
};
