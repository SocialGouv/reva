import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Add } from "../components/atoms/Icons";
import { Input } from "../components/atoms/Input";
import { Select } from "../components/atoms/Select";
import { Textarea } from "../components/atoms/Textarea";
import { Title } from "../components/atoms/Title";
import { BackButton } from "../components/molecules/BackButton";
import { Page } from "../components/organisms/Page";
import { Experience } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface ProjectExperiencesProps {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

interface FormElements extends HTMLFormControlsCollection {
  title: HTMLInputElement;
  startDate: HTMLInputElement;
  duration: HTMLSelectElement;
  description: HTMLTextAreaElement;
}

interface ExperienceFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export const ProjectExperiences = ({
  mainService,
}: ProjectExperiencesProps) => {
  const [state, send] = useActor(mainService);

  function ExperiencePreview(experience: Experience, index: number) {
    return (
      <div
        key={`experience-${index}`}
        className="rounded-lg bg-gray-100 h-64 py-2 px-8"
      >
        <Title label={experience.title} />
        <p className="italic py-4">"{experience.description}"</p>
      </div>
    );
  }

  return (
    <Page
      className="z-[70] h-full flex flex-col bg-white pt-6 px-8"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />
      <div className="mt-2 grow overflow-y-auto w-full space-y-3">
        <Title size="small" label="Mes experiences professionnelles" />
        {state.context.experiences.map(ExperiencePreview)}
        <div
          onClick={() => send("ADD_EXPERIENCE")}
          className="mb-8 cursor-pointer flex items-center justify-center border rounded-lg border-dashed border-gray-300 p-4"
        >
          <div className="rounded-full h-[46px] w-[46px] bg-gray-100 p-[14px]">
            <Add />
          </div>
        </div>
      </div>
      <div className="bg-white flex justify-center pt-6 pb-12">
        <Button
          onClick={() => send("SUBMIT_EXPERIENCES")}
          type="submit"
          label="Valider"
          size="medium"
        />
      </div>
    </Page>
  );
};
