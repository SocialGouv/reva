import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Input } from "../components/atoms/Input";
import { Title } from "../components/atoms/Title";
import { BackButton } from "../components/molecules/BackButton";
import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

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
        <Title label="Bientôt" />
        {false && state.context.selectedRegion && (
          <Title
            label={`Accompagnateurs disponibles pour la région ${state.context.selectedRegion?.label}`}
          />
        )}
        <p className="my-4">
          Vous pourrez choisir l'accompagnateur qui vous aidera à construire ce
          projet.
        </p>
      </div>
    </Page>
  );
};
