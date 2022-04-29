import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Add, Edit } from "../components/atoms/Icons";
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

  const allExperiences = state.context.experiences.edited
    ? [...state.context.experiences.rest, state.context.experiences.edited]
    : state.context.experiences.rest;

  const sortedExperiences = allExperiences.sort(
    (e1, e2) => e2.startDate.getTime() - e1.startDate.getTime()
  );

  function ExperiencePreview(experience: Experience, index: number) {
    return (
      <li
        key={`experience-${index}`}
        className="text-slate-800 rounded-lg bg-gray-100 h-64 py-2 px-8"
      >
        <div className="w-full flex items-center justify-between">
          <Title
            data-test="project-experience-title"
            label={experience.title}
          />
          <button
            type="button"
            onClick={() => send({ type: "EDIT_EXPERIENCE", index })}
            className="-mr-2 cursor-pointer pt-3 shrink-0 w-[24px]"
          >
            <Edit />
            <span className="sr-only">Modifier</span>
          </button>
        </div>
        <p data-test="project-experience-description" className="italic py-4">
          "{experience.description}"
        </p>
      </li>
    );
  }

  return (
    <Page
      className="z-[70] h-full flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />
      <div className="mt-2 grow overflow-y-auto w-full space-y-3 px-8">
        <Title size="small" label="Mes experiences professionnelles" />
        <ul data-test="project-experiences-overview">
          {sortedExperiences.map(ExperiencePreview)}
        </ul>
        <div
          onClick={() => send("ADD_EXPERIENCE")}
          className="mb-8 cursor-pointer flex items-center justify-center border rounded-lg border-dashed border-gray-300 p-4"
        >
          <button
            data-test="project-experiences-add"
            type="button"
            className="rounded-full h-[46px] w-[46px] bg-gray-100 p-[14px]"
          >
            <Add />
            <span className="sr-only">Ajouter</span>
          </button>
        </div>
      </div>
      <div className="bg-white flex justify-center pt-6 pb-12">
        <Button
          data-test="project-experiences-submit"
          onClick={() => send("SUBMIT_EXPERIENCES")}
          type="submit"
          label="Valider"
          size="medium"
        />
      </div>
    </Page>
  );
};
