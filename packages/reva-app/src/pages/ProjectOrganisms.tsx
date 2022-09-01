import { RadioGroup } from "@headlessui/react";
import { useActor } from "@xstate/react";
import classNames from "classnames";
import { FC, useState } from "react";
import { Interpreter, State } from "xstate";

import { Button } from "../components/atoms/Button";
import { Title } from "../components/atoms/Title";
import { BackButton } from "../components/molecules/BackButton";
import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface PropsOrganisms {
  xstate: State<MainContext, MainEvent, any, MainState, any>;
}

//TODO: extract in its own file
const Organisms: FC<PropsOrganisms> = ({ xstate }) => {
  const currentOrganisms = xstate.context.organisms || [];
  const [selected, setSelected] = useState(currentOrganisms[0]);
  if (!currentOrganisms) return <p>chargement des organismes...</p>;

  return (
    <RadioGroup value={selected} onChange={setSelected}>
      <RadioGroup.Label className="sr-only">Accompagnateur</RadioGroup.Label>
      <div className="space-y-4">
        {currentOrganisms.map((organism) => (
          <RadioGroup.Option
            key={organism.id}
            value={organism}
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
              <p data-test="project-home-organism-email">{organism.email}</p>
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

  return (
    <Page
      className="z-[80] flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />
      <div className="h-full flex flex-col overflow-y-auto">
        <div className="grow overflow-y-auto px-8 pb-8">
          {state.context.selectedRegion && (
            <Title
              label={`Accompagnateurs disponibles pour la région ${state.context.selectedRegion?.label}`}
            />
          )}
          <p className="mt-4 mb-12">
            Choisissez l'accompagnateur qui vous aidera à construire ce projet.
          </p>
          <Organisms xstate={state} />
        </div>
        <div className="flex justify-center pt-8 pb-16">
          <Button
            data-test="project-organisms-submit-organism"
            size="medium"
            label="OK"
            loading={state.matches("projectOrganism.submitting")}
            onClick={() => {}}
          />
        </div>
      </div>
    </Page>
  );
};
