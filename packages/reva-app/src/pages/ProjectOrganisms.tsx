import { RadioGroup } from "@headlessui/react";
import { useActor } from "@xstate/react";
import classNames from "classnames";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Title } from "../components/atoms/Title";
import { BackButton } from "../components/molecules/BackButton";
import { Page } from "../components/organisms/Page";
import { Organism } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface PropsOrganisms {
  availableOrganisms?: Organism[];
  setOrganismId: Dispatch<SetStateAction<string>>;
  alreadySelectedOrganismId: string;
}

//TODO: extract in its own file
const Organisms: FC<PropsOrganisms> = ({
  availableOrganisms,
  setOrganismId,
  alreadySelectedOrganismId,
}) => {
  const organisms = availableOrganisms || [];
  const [selectedOrganismId, setSelectedOrganismId] = useState("");

  useEffect(() => {
    setSelectedOrganismId(alreadySelectedOrganismId);
  }, [alreadySelectedOrganismId]);

  if (!organisms) return <p>chargement des organismes...</p>;

  return (
    <RadioGroup value={selectedOrganismId} onChange={setSelectedOrganismId}>
      <RadioGroup.Label className="sr-only">Accompagnateur</RadioGroup.Label>
      <div className="space-y-4">
        {organisms.map((organism) => (
          <RadioGroup.Option
            key={organism.id}
            value={organism.id}
            className={({ active, checked }) =>
              classNames(
                active
                  ? "ring-2 ring-indigo-500"
                  : checked
                  ? "ring-2 ring-slate-500"
                  : "",
                "relative block cursor-pointer bg-slate-100 focus:outline-none",
                "block rounded-lg px-6 py-4",
                "text-lg"
              )
            }
            onClick={() => setOrganismId(organism.id)}
          >
            <RadioGroup.Label as="h3" className="font-bold text-slate-800">
              {organism.label}
            </RadioGroup.Label>
            <RadioGroup.Description
              as="address"
              className="text-gray-700 not-italic leading-relaxed"
            >
              <p data-test="project-home-organism-address">
                {organism.address}
              </p>
              <p data-test="project-home-organism-address">
                {organism.zip} {organism.city}
              </p>
              <p data-test="project-home-organism-email">
                {organism.contactAdministrativeEmail}
              </p>
            </RadioGroup.Description>
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
  const { direction, selectedRegion, organism, organisms, candidacyId } =
    state.context;

  const [selectedOrganismId, setSelectedOrganismId] = useState(
    organism?.id || ""
  );

  useEffect(() => {
    if (!!organisms && !!organisms.length && selectedOrganismId === "") {
      setSelectedOrganismId(organisms[0].id);
    }
  }, [organisms, selectedOrganismId]);

  if (!candidacyId) return <p>Aucun Id de candidat trouvé</p>;

  return (
    <Page className="z-[80] flex flex-col bg-white pt-6" direction={direction}>
      <BackButton onClick={() => send("BACK")} />
      <div className="h-full flex flex-col overflow-y-auto">
        <div className="grow overflow-y-auto px-8 pb-8">
          {selectedRegion && (
            <Title
              label={`Accompagnateurs disponibles pour la région ${selectedRegion?.label}`}
            />
          )}
          <p className="mt-4 mb-12">
            Choisissez l'accompagnateur qui vous aidera à construire ce projet.
          </p>
          <Organisms
            alreadySelectedOrganismId={selectedOrganismId}
            availableOrganisms={organisms}
            setOrganismId={setSelectedOrganismId}
          />
        </div>
        <div className="flex justify-center pt-8 pb-16">
          <Button
            data-test="project-organisms-submit-organism"
            size="medium"
            label="OK"
            loading={state.matches("projectOrganism.submitting")}
            onClick={() =>
              send({
                type: "SUBMIT_ORGANISM",
                organism: { candidacyId, selectedOrganismId },
              })
            }
          />
        </div>
      </div>
    </Page>
  );
};
