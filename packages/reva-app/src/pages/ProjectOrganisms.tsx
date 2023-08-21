import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { RadioGroup } from "@headlessui/react";
import { useActor } from "@xstate/react";
import classNames from "classnames";
import { SearchBar } from "components/molecules/SearchBar/SearchBar";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { Interpreter } from "xstate";

import { BackToHomeButton } from "../components/molecules/BackToHomeButton/BackToHomeButton";
import { Page } from "../components/organisms/Page";
import { Organism } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface PropsOrganisms {
  availableOrganisms?: Organism[];
  setOrganismId: Dispatch<SetStateAction<string>>;
  alreadySelectedOrganismId: string;
}

const Organisms: FC<PropsOrganisms> = ({
  availableOrganisms = [],
  setOrganismId,
  alreadySelectedOrganismId,
}) => {
  const [selectedOrganismId, setSelectedOrganismId] = useState(
    alreadySelectedOrganismId
  );

  console.log({ availableOrganisms });

  return (
    <RadioGroup
      value={selectedOrganismId || availableOrganisms[0]?.id}
      onChange={setSelectedOrganismId}
    >
      <RadioGroup.Label className="sr-only">Accompagnateur</RadioGroup.Label>
      <div className="space-y-4">
        {availableOrganisms.map((organism) => (
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
                  className=""
                >
                  {organism.label}
                </RadioGroup.Label>
                <RadioGroup.Description
                  as="address"
                  className="not-italic leading-relaxed"
                >
                  <p>
                    <span data-test="project-organisms-organism-email">
                      {organism.contactAdministrativeEmail}
                    </span>
                    {organism.contactAdministrativePhone && (
                      <>
                        &nbsp; - &nbsp;
                        <span data-test="project-organisms-organism-phone">
                          {organism.contactAdministrativePhone}
                        </span>
                      </>
                    )}
                    <div className="flex justify-end gap-1 mt-2 lg:mt-0">
                      {organism.organismOnDepartments?.[0]?.isOnSite && (
                        <Tag className="bg-dsfrBlue-500 text-white">
                          Sur place
                        </Tag>
                      )}
                      {organism.organismOnDepartments?.[0]?.isRemote && (
                        <Tag className="bg-dsfrBlue-300 text-dsfrBlue-500">
                          À distance
                        </Tag>
                      )}
                    </div>
                  </p>
                </RadioGroup.Description>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
};

interface Props {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

export const ProjectOrganisms: FC<Props> = ({ mainService }) => {
  const [state, send] = useActor(mainService);
  const { selectedDepartment, organism, organisms, candidacyId } =
    state.context;
  const [selectedOrganismId, setSelectedOrganismId] = useState(
    organism?.id || ""
  );

  const isOrganismsLoaded = organisms && organisms.length > 0;

  if (!candidacyId) return <p>Aucun Id de candidat trouvé</p>;

  return (
    <Page title="Votre organisme d'accompagnement">
      <BackToHomeButton />
      <h1 className="mt-4 text-3xl font-bold">
        Votre organisme d'accompagnement
      </h1>
      <SearchBar
        label={"Rechercher un organisme"}
        nativeInputProps={{
          defaultValue: state.context.organismSearchText,
          onChange: (e) => {
            send({
              type: "SET_ORGANISM_SEARCH_TEXT",
              organismSearchText: e.target.value,
            });
          },
        }}
        className="mt-6"
      />

      {selectedDepartment && (
        <>
          <p className="mt-6 text-black">
            Voici les organismes d'accompagnement disponibles dans votre
            département.
          </p>
          <p className="mb-4 text-black"> Cochez celui de votre choix.</p>
        </>
      )}
      <Organisms
        alreadySelectedOrganismId={selectedOrganismId}
        availableOrganisms={organisms}
        setOrganismId={setSelectedOrganismId}
      />
      <Button
        className="mt-6 justify-center w-[100%]  md:w-fit"
        data-test="project-organisms-submit-organism"
        disabled={!isOrganismsLoaded}
        nativeButtonProps={{
          onClick: () => {
            if (isOrganismsLoaded) {
              send({
                type: "SUBMIT_ORGANISM",
                organism: {
                  candidacyId,
                  selectedOrganismId: selectedOrganismId || organisms[0]?.id,
                },
              });
            }
          },
        }}
      >
        Validez votre organisme d'accompagnement
      </Button>
    </Page>
  );
};
