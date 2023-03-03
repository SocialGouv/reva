import { Button } from "@codegouvfr/react-dsfr/Button";
import { RadioGroup } from "@headlessui/react";
import { useActor } from "@xstate/react";
import classNames from "classnames";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
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
  const [shuffledOrganisms, setShuffledOrganisms] =
    useState(availableOrganisms);
  const [selectedOrganismId, setSelectedOrganismId] = useState(
    alreadySelectedOrganismId
  );

  useEffect(() => {
    setShuffledOrganisms(availableOrganisms.sort(() => 0.5 - Math.random()));
  }, [availableOrganisms]);

  return (
    <RadioGroup
      value={selectedOrganismId || shuffledOrganisms[0]?.id}
      onChange={setSelectedOrganismId}
    >
      <RadioGroup.Label className="sr-only">Accompagnateur</RadioGroup.Label>
      <div className="space-y-4">
        {shuffledOrganisms.map((organism) => (
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
                  <p data-test="project-organisms-organism-address">
                    {organism.address}
                  </p>
                  <p data-test="project-organisms-organism-zip-city">
                    {organism.zip} {organism.city}
                  </p>
                  <p data-test="project-organisms-organism-email">
                    {organism.contactAdministrativeEmail}
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
  const { direction, selectedDepartment, organism, organisms, candidacyId } =
    state.context;
  const [selectedOrganismId, setSelectedOrganismId] = useState(
    organism?.id || ""
  );

  const isOrganismsLoaded = organisms && organisms.length > 0;

  if (!candidacyId) return <p>Aucun Id de candidat trouvé</p>;

  return (
    <Page direction={direction}>
      <BackToHomeButton />
      <h1 className="mt-4 text-3xl font-bold">Votre référent</h1>
      {selectedDepartment && (
        <>
          <p className="mt-6 text-black">
            Voici les architectes de parcours disponibles dans votre
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
        className="mt-6 justify-center w-[100%]  md:w-min"
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
        Valider
      </Button>
    </Page>
  );
};
