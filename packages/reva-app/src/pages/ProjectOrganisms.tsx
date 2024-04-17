import { Button } from "@codegouvfr/react-dsfr/Button";
import { ReactComponent as IconBuilding } from "@codegouvfr/react-dsfr/dsfr/icons/buildings/building-fill.svg";
import { ReactComponent as IconCustomerService } from "@codegouvfr/react-dsfr/dsfr/icons/business/customer-service-fill.svg";
import { ReactComponent as IconInformation } from "@codegouvfr/react-dsfr/dsfr/icons/system/information-fill.svg";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
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
import { Page } from "../components/organisms/Page";
import { useMainMachineContext } from "../contexts/MainMachineContext/MainMachineContext";
import { Department, Organism } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

const modalDistanceInfo = createModal({
  id: "distance-organism-info",
  isOpenedByDefault: false,
});

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

  if (state.context.activeFeatures.includes("NEW_CANDIDATE_ORGANISM_RESULTS")) {
    return (
      <div className="columns-2 space-y-4 gap-4">
        {<OrganismGroup indexPredicate={(i) => i % 2 === 0} />}
        {<OrganismGroup indexPredicate={(i) => i % 2 === 1} />}
      </div>
    );
  }

  return (
    <RadioGroup
      value={selectedOrganismId || availableOrganisms.rows[0]?.id}
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
  } = xstate.context;

  const [selectedOrganismId, setSelectedOrganismId] = useState(
    organism?.id || ""
  );

  const tagFilledStyle = (isSelected: boolean) =>
    isSelected
      ? "bg-dsfrBlue-500 text-white"
      : "bg-dsfrBlue-300 text-dsfrBlue-500";
  const iconTagFilledStyle = (isSelected: boolean) =>
    isSelected ? "fill-white" : "fill-dsfrBlue-500";

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
    loadOrganisms(0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organisms]);

  if (!candidacyId) return <p>Aucun Id de candidat trouvé</p>;

  return (
    <>
      <Page title="Votre organisme d'accompagnement">
        <BackToHomeButton />
        <ErrorAlertFromState />
        <h1 className="mt-4 text-3xl font-bold">
          Votre organisme d'accompagnement
        </h1>
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
              });
            },
          }}
          className="mt-6"
        />

        <div>
          <p className="mt-4 mb-2">
            Comment souhaitez-vous être suivi pour votre VAE ?
          </p>
          <div className="flex items-center">
            <Button
              data-test="button-select-onsite"
              priority="tertiary no outline"
              title="Choisir sur site"
              onClick={() => {
                send({
                  type: "SET_ORGANISM_SEARCH",
                  organismSearchText,
                  organismSearchOnsite: !organismSearchOnsite,
                  organismSearchRemote,
                });
              }}
              className="p-2"
            >
              <Tag className={tagFilledStyle(organismSearchOnsite)}>
                <IconBuilding
                  className={classNames(
                    iconTagFilledStyle(organismSearchOnsite),
                    "mr-1"
                  )}
                />
                <span>Sur place</span>
              </Tag>
            </Button>
            <Button
              data-test="button-select-remote"
              priority="tertiary no outline"
              title="Choisir à distance"
              onClick={() => {
                send({
                  type: "SET_ORGANISM_SEARCH",
                  organismSearchText,
                  organismSearchOnsite,
                  organismSearchRemote: !organismSearchRemote,
                });
              }}
              className="p-2"
            >
              <Tag className={tagFilledStyle(organismSearchRemote)}>
                <IconCustomerService
                  className={classNames(
                    iconTagFilledStyle(organismSearchRemote),
                    "mr-1"
                  )}
                />
                <span>À distance</span>
              </Tag>
            </Button>
            <Button
              data-test="button-open-modal-distance"
              priority="tertiary no outline"
              title="Quelle option à distance choisir ?"
              className="flex py-1 pl-2 pr-3"
              onClick={() => modalDistanceInfo.open()}
            >
              <IconInformation className="fill-dsfrBlue-500 mr-2" />
              <span className="text-dsfrBlue-500 text-sm font-bold">
                Quelle option choisir ?
              </span>
            </Button>
          </div>
        </div>

        {selectedDepartment && (
          <>
            <p className="mt-6 text-black">
              {organisms && organisms.totalRows > 0
                ? `Il y a ${organisms.totalRows} organisme(s) d'accompagnement disponible(s) dans votre
              département.`
                : "Il n'y a pas d'organismes d'accompagnement disponibles dans votre département."}
            </p>
            <p className="mb-4 text-black"> Cochez celui de votre choix.</p>
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
      </Page>
      <modalDistanceInfo.Component
        title="Comment bien choisir entre “sur site” et “à distance” ?"
        size="large"
      >
        <p className="my-4">
          Les accompagnements <strong>sur site </strong>
          sont réalisés directement dans les locaux de l’organisme sélectionné.
        </p>
        <p>
          Les accompagnements <strong>à distance</strong> se déroulent
          essentiellement par téléphone ou sur internet, via des outils de
          visio-conférence.
        </p>
      </modalDistanceInfo.Component>
    </>
  );
};
