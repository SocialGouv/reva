import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { RadioGroup } from "@headlessui/react";
import { useActor } from "@xstate/react";
import classNames from "classnames";
import { ErrorAlertFromState } from "components/molecules/ErrorAlertFromState/ErrorAlertFromState";
import { SearchBar } from "components/molecules/SearchBar/SearchBar";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { Interpreter } from "xstate";

import { BackToHomeButton } from "../components/molecules/BackToHomeButton/BackToHomeButton";
import { OrganismCard } from "../components/organisms/OrganismCard/OrganismCard";
import { OrganismFilters } from "../components/organisms/OrganismFilters/OrganismFilters";
import { Page } from "../components/organisms/Page";
import { useMainMachineContext } from "../contexts/MainMachineContext/MainMachineContext";
import { Department, Organism } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface PropsOrganisms {
  submitOrganism: ({ organismId }: { organismId: string }) => void;
  availableOrganisms?: { rows: Organism[]; totalRows: number };
  setOrganismId: Dispatch<SetStateAction<string>>;
  alreadySelectedOrganismId: string;
  selectedDepartment?: Department;
}

const Organisms: FC<PropsOrganisms> = ({
  submitOrganism,
  availableOrganisms = { rows: [], totalRows: 0 },
  setOrganismId,
  alreadySelectedOrganismId,
  selectedDepartment,
}) => {
  const [selectedOrganismId, setSelectedOrganismId] = useState(
    alreadySelectedOrganismId
  );

  const { state } = useMainMachineContext();

  const getOrganismDisplayInfo = (o: Organism) => {
    const ic = o?.informationsCommerciales;
    return {
      label: ic?.nom || o.label,
      website: ic?.siteInternet || o.website,
      email: ic?.emailContact || o.contactAdministrativeEmail,
      phone: ic?.telephone || o.contactAdministrativePhone,
      pmr: ic?.conformeNormesAccessbilite === "CONFORME",
      addressStreet: ic?.adresseNumeroEtNomDeRue,
      addressAdditionalInfo: ic?.adresseInformationsComplementaires,
      addressZipCode: ic?.adresseCodePostal,
      addressCity: ic?.adresseVille,
    };
  };

  const organismSearchResults =
    // The API appends the already selected organism, if any.
    // We remove it from search results, unless the selected organism is part of the search results.
    // Once this new feature is enabled by default, we'll update the API instead.
    availableOrganisms.totalRows === availableOrganisms.rows.length
      ? availableOrganisms.rows
      : availableOrganisms.rows.filter(
          (organism) => organism.id !== alreadySelectedOrganismId
        );

  const OrganismGroup = ({
    indexPredicate,
  }: {
    indexPredicate: (index: number) => boolean;
  }) => {
    return (
      <>
        {organismSearchResults
          .filter((organism, index) => indexPredicate(index))
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

  if (state.context.activeFeatures.includes("NEW_CANDIDATE_ORGANISM_RESULTS")) {
    return (
      <div className="md:columns-2 space-y-4 gap-4 max-w-3xl">
        {<OrganismGroup indexPredicate={(i) => i % 2 === 0} />}
        {<OrganismGroup indexPredicate={(i) => i % 2 === 1} />}
      </div>
    );
  }

  return (
    <RadioGroup
      value={selectedOrganismId || availableOrganisms.rows[0]?.id || ""}
      onChange={setSelectedOrganismId}
    >
      <RadioGroup.Label className="sr-only">Accompagnateur</RadioGroup.Label>
      <div className="space-y-4">
        {availableOrganisms.rows.map((organism) => {
          const organismDisplayInfo = getOrganismDisplayInfo(organism);
          return (
            <RadioGroup.Option
              data-test={`project-organisms-organism-${organism.id}`}
              key={organism.id}
              value={organism.id}
              className={({ active }) =>
                classNames(
                  active ? "ring-2 ring-indigo-500" : "",
                  "relative block cursor-pointer bg-white focus:outline-none",
                  "border  border-dsfrBlue-500 p-4",
                  "text-lg text-black"
                )
              }
              onClick={() => setOrganismId(organism.id)}
            >
              {({ checked }) => (
                <>
                  {checked && (
                    <span className="fr-icon-success-fill absolute top-4 right-4 text-dsfrBlue-500" />
                  )}
                  <RadioGroup.Label
                    as="h3"
                    data-test="project-organisms-organism-label"
                  >
                    {organismDisplayInfo.website ? (
                      <a href={organismDisplayInfo.website} target="blank">
                        {organismDisplayInfo.label}
                      </a>
                    ) : (
                      organismDisplayInfo.label
                    )}
                  </RadioGroup.Label>
                  <RadioGroup.Description
                    as="address"
                    className="not-italic leading-relaxed"
                  >
                    <div className="flex flex-col gap-2 mt-2">
                      {organismDisplayInfo?.addressStreet && (
                        <div data-test="project-organisms-organism-address">
                          <p>{organismDisplayInfo.addressStreet}</p>
                          <p> {organismDisplayInfo.addressAdditionalInfo}</p>
                          <p>
                            {organismDisplayInfo.addressCity} -{" "}
                            {organismDisplayInfo.addressZipCode}
                          </p>
                        </div>
                      )}
                      {organismDisplayInfo.pmr && (
                        <p data-test="project-organisms-organism-accessibilite-pmr">
                          Accessibilité PMR
                        </p>
                      )}
                      <p>
                        <span data-test="project-organisms-organism-email">
                          {organismDisplayInfo.email}
                        </span>
                        {organismDisplayInfo.phone && (
                          <>
                            &nbsp; - &nbsp;
                            <span data-test="project-organisms-organism-phone">
                              {organismDisplayInfo.phone}
                            </span>
                          </>
                        )}
                      </p>
                      <div className="flex justify-end gap-1 mt-2 lg:mt-0">
                        {organism.organismOnDepartments?.[0]?.isOnSite && (
                          <Tag
                            data-test="project-organisms-onsite-tag"
                            className="bg-dsfrBlue-500 text-white"
                          >
                            Sur place
                          </Tag>
                        )}
                        {organism.organismOnDepartments?.[0]?.isRemote && (
                          <Tag
                            data-test="project-organisms-remote-tag"
                            className="bg-dsfrBlue-300 text-dsfrBlue-500"
                          >
                            À distance
                          </Tag>
                        )}
                      </div>
                    </div>
                  </RadioGroup.Description>
                </>
              )}
            </RadioGroup.Option>
          );
        })}
      </div>
    </RadioGroup>
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
    organism,
    organisms,
    candidacyId,
    organismSearchText,
    organismSearchOnsite,
    organismSearchRemote,
    activeFeatures,
    organismSearchDistance,
    organismSearchZipOrCity,
  } = xstate.context;

  const [selectedOrganismId, setSelectedOrganismId] = useState(
    organism?.id || ""
  );

  const isOrganismsLoaded = organisms && organisms.rows.length > 0;

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
            nativeInputProps={{
              defaultValue: organismSearchText,
              onChange: (e) => {
                send({
                  type: "SET_ORGANISM_SEARCH",
                  organismSearchText: e.target.value,
                  organismSearchOnsite,
                  organismSearchRemote,
                  organismSearchDistance,
                  organismSearchZipOrCity,
                });
              },
            }}
            className="mt-6"
          />
        </div>
        <div className="lg:flex gap-x-6">
          <div className="lg:w-1/3">
            <OrganismFilters
              onSearch={({
                organismSearchText,
                organismSearchOnsite,
                organismSearchRemote,
                organismSearchDistance,
                organismSearchZipOrCity,
              }) =>
                send({
                  type: "SET_ORGANISM_SEARCH",
                  organismSearchText,
                  organismSearchOnsite,
                  organismSearchRemote,
                  organismSearchDistance,
                  organismSearchZipOrCity,
                })
              }
              filters={{
                organismSearchText,
                organismSearchRemote,
                organismSearchOnsite,
                organismSearchDistance,
                organismSearchZipOrCity,
              }}
              filterDistanceIsActive={activeFeatures.includes(
                "CANDIDATE_APP_FILTER_DISTANCE"
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
                ) : activeFeatures.includes(
                    "NEW_CANDIDATE_ORGANISM_RESULTS"
                  ) ? (
                  <div className="min-h-80 h-full flex flex-col items-center justify-center">
                    <h3 className="text-2xl font-bold mb-4">
                      Pas de résultats
                    </h3>
                    <p className="text-lg max-w-md text-center leading-relaxed">
                      Nous ne trouvons pas d’accompagnateurs sur votre diplôme
                      avec les critères sélectionnés.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 mb-4 text-gray-500">
                    Il n'y a pas d'organismes d'accompagnement disponibles dans
                    votre département.
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
              alreadySelectedOrganismId={selectedOrganismId}
              availableOrganisms={{
                rows: state.rows,
                totalRows: organisms?.totalRows || 0,
              }}
              setOrganismId={setSelectedOrganismId}
              selectedDepartment={selectedDepartment}
            />
            <div
              className={`mt-6 w-full flex flex-row items-center ${
                activeFeatures.includes("NEW_CANDIDATE_ORGANISM_RESULTS")
                  ? "justify-center"
                  : "justify-between"
              }`}
            >
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
              {!activeFeatures.includes("NEW_CANDIDATE_ORGANISM_RESULTS") && (
                <Button
                  data-test="project-organisms-submit-organism"
                  disabled={!isOrganismsLoaded}
                  nativeButtonProps={{
                    onClick: () => {
                      if (isOrganismsLoaded) {
                        send({
                          type: "SUBMIT_ORGANISM",
                          organism: {
                            candidacyId,
                            selectedOrganismId:
                              selectedOrganismId || state.rows[0]?.id,
                          },
                        });
                      }
                    },
                  }}
                >
                  Validez votre organisme d'accompagnement
                </Button>
              )}
            </div>
          </div>
        </div>
      </Page>
    </>
  );
};
