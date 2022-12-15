import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";

import { Locked } from "../components/atoms/Icons";
import { Title } from "../components/atoms/Title";
import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent } from "../machines/main.machine";

interface ProjectDroppedOutProps {
  mainService: Interpreter<MainContext, any, MainEvent, any, any>;
}

export const ProjectDroppedOut = ({mainService}: ProjectDroppedOutProps) => {
  const [state] = useActor(mainService);

  return (
    <Page
      data-test="project-dropped-out"
      className="z-[80] overflow-hidden h-full flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <div className="absolute text-neutral-200 left-[-70px] top-[100px] w-[200px]">
        <Locked />
      </div>
      <div className="relative overflow-y-auto flex flex-col mt-8 rounded-xl p-12 text-slate-800 leading-loose">
        <div className="flex justify-center">
          <Title label="End of the road" />
        </div>
        <p>
          You dropped out, sucker.
        </p>
      </div>
    </Page>
  );
};
