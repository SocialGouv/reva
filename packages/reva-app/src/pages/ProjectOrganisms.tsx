import { RadioGroup } from "@headlessui/react";
import { useActor } from "@xstate/react";
import { useState } from "react";
import { Interpreter } from "xstate";

import { Title } from "../components/atoms/Title";
import { BackButton } from "../components/molecules/BackButton";
import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

const organisms = [
  {
    id: "id1",
    address: "2, rue Hippolyte Bayard",
    city: "Beauvais",
    email: "stephane.pottier@apradis.eu",
    label: "CNEAP 1 Hauts de France / Apradis",
    zip: "60 000",
  },
  {
    id: "id2",
    address: "2, rue Hippolyte Bayard",
    city: "Beauvais",
    email: "stephane.pottier@apradis.eu",
    label: "CNEAP 2 Hauts de France / Apradis",
    zip: "60 000",
  },
  {
    id: "id3",
    address: "2, rue Hippolyte Bayard",
    city: "Beauvais",
    email: "stephane.pottier@apradis.eu",
    label: "CNEAP 3 Hauts de France / Apradis",
    zip: "60 000",
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function Organism() {
  const [selected, setSelected] = useState(organisms[0]);

  return (
    <RadioGroup value={selected} onChange={setSelected}>
      <RadioGroup.Label className="sr-only"> Server size </RadioGroup.Label>
      <div className="space-y-4">
        {organisms.map((organism) => (
          <RadioGroup.Option
            key={organism.id}
            value={organism}
            className={({ checked, active }) =>
              classNames(
                active ? "border-slate-500 ring-2 ring-slate-500" : "",
                "relative block cursor-pointer border border-transparent bg-slate-100 focus:outline-none",
                "block rounded-lg px-6 py-4",
                "text-lg"
              )
            }
          >
            {({ active, checked }) => (
              <>
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
                    {organism.email}
                  </p>
                </RadioGroup.Description>

                <span
                  className={classNames(
                    active ? "border" : "border-2",
                    checked ? "border-slate-500" : "border-transparent",
                    "pointer-events-none absolute -inset-px rounded-lg"
                  )}
                  aria-hidden="true"
                />
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
}

interface ProjectOrganismsProps {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

export const ProjectOrganisms = ({ mainService }: ProjectOrganismsProps) => {
  const [state, send] = useActor(mainService);

  return (
    <Page
      className="z-[80] flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />
      <div className="h-full flex flex-col px-8 overflow-y-auto pt-12 pb-[400px]">
        {state.context.selectedRegion && (
          <Title
            label={`Accompagnateurs disponibles pour la région ${state.context.selectedRegion?.label}`}
          />
        )}
        <p className="my-4">
          Choisissez l'accompagnateur qui vous aidera à construire ce projet.
        </p>
        <Organism />
      </div>
    </Page>
  );
};
