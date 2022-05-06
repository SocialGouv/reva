import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { TextResult } from "../components/atoms/TextResult";
import { BackButton } from "../components/molecules/BackButton";
import { ProgressTitle } from "../components/molecules/ProgressTitle";
import certificationImg from "../components/organisms/Card/certification.png";
import { Page } from "../components/organisms/Page";
import { Certification, Experience, duration } from "../interface";
import { MainContext, MainEvent } from "../machines/main.machine";
import { sortExperiences } from "../utils/experienceHelpers";
import { projectProgress } from "../utils/projectProgress";

interface ProjectHomeProps {
  certification: Certification;
  mainService: Interpreter<MainContext, any, MainEvent, any, any>;
}

const durationToString: {
  [key in duration]: string;
} = {
  unknown: "Durée inconnue",
  lessThanOneYear: "Moins d'un an",
  betweenOneAndThreeYears: "Entre 1 et 3 ans",
  moreThanThreeYears: "Plus de 3 ans",
  moreThanFiveYears: "Plus de 5 ans",
  moreThanTenYears: "Plus de 10 ans",
};

const ExperienceSummary = (experience: Experience, index: number) => (
  <li
    key={index}
    className="shrink-0 h-[123px] w-[156px] flex flex-col justify-end rounded overflow-hidden bg-gray-50 px-4 py-3"
  >
    <p data-test="project-home-experience-duration" className="font-semibold">
      {durationToString[experience.duration]}
    </p>
    <p data-test="project-home-experience-title">{experience.title}</p>
  </li>
);
export const ProjectHome = ({
  certification,
  mainService,
}: ProjectHomeProps) => {
  const [state, send] = useActor(mainService);

  const selectedGoals = state.context.goals.filter((goal) => goal.checked);

  const sortedExperiences = sortExperiences(state.context.experiences);

  const editCertification = (
    <div className="bg-slate-900 rounded-xl overflow-hidden mt-6">
      <div className={`mt-5 mr-6 text-white text-right font-bold grow `}>
        {certification.codeRncp}
      </div>
      <img
        className=""
        style={{
          marginLeft: "-42px",
          marginTop: "-28px",
          height: "104px",
          width: "104px",
        }}
        src={certificationImg}
      />
      <div className="px-8 pb-6">
        <TextResult size="small" title={certification.label} color="light" />
        <Button
          data-test="project-home-close-selected-certification"
          size="tiny"
          label="Modifier"
          className="mt-4 text-slate-900 bg-white"
          onClick={() => send("CLOSE_SELECTED_CERTIFICATION")}
        />
      </div>
    </div>
  );

  const homeContent = (
    <div className="px-8 grow overflow-y-auto pb-8">
      <ProgressTitle
        progress={projectProgress(state.context)}
        size="large"
        title="Projet"
      />
      <div className="space-y-4">
        {editCertification}
        <div className="rounded-xl pl-8 pr-6 py-6 bg-purple-100 text-purple-800">
          <h4 className="font-bold mb-2 text-xl">Mon objectif</h4>
          <ul className="mb-4 text-lg leading-tight">
            {selectedGoals.map((goal) => (
              <li className="mb-2" key={goal.id}>
                {goal.label}
              </li>
            ))}
          </ul>
          <Button
            data-test="project-home-edit-goals"
            size="tiny"
            label={selectedGoals.length > 0 ? "Modifier" : "Choisir"}
            className="text-white bg-purple-800"
            onClick={() => send("EDIT_GOALS")}
          />
        </div>
        <div className="rounded-xl px-8 py-6 bg-slate-100">
          <h4 className="font-bold text-slate-800 text-xl mb-4">
            Mes experiences
          </h4>
          {sortedExperiences.length > 0 && (
            <ul
              data-test="project-home-experiences"
              className="mb-2 pb-2 flex space-x-3 overflow-x-auto"
            >
              {sortedExperiences.map(ExperienceSummary)}
            </ul>
          )}
          <div className="text-sm text-slate-400">
            <Button
              data-test="project-home-edit-experiences"
              onClick={() => send("EDIT_EXPERIENCES")}
              size="tiny"
              label={sortedExperiences.length > 0 ? "Modifier" : "Ajouter"}
            />
          </div>
        </div>
        <div className="rounded-xl px-8 py-6 bg-neutral-100">
          <h4 className="font-bold text-slate-800 text-xl mb-4">Mon contact</h4>
          {state.context.contact?.phone && (
            <p data-test="project-home-contact-phone" className="mt-2">
              {state.context.contact?.phone}
            </p>
          )}
          {state.context.contact?.email && (
            <p data-test="project-home-contact-email" className="mt-2">
              {state.context.contact?.email}
            </p>
          )}
          <div className="mt-4 text-sm text-slate-400">
            <Button
              data-test="project-home-edit-contact"
              onClick={() => send("EDIT_CONTACT")}
              size="tiny"
              label={
                state.context.contact &&
                (state.context.contact?.phone != "" ||
                  state.context.contact?.email != "")
                  ? "Modifer"
                  : "Ajouter"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Page
      className="z-[60] h-full flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />
      {homeContent}
      <div className="bg-white flex justify-center pt-6 pb-12">
        <Button
          data-test="project-experiences-submit"
          locked={true}
          onClick={() => send("SUBMIT_EXPERIENCES")}
          type="submit"
          label="Valider"
          size="medium"
        />
      </div>
    </Page>
  );
};
