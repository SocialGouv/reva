import { Button as DsfrButton } from "@codegouvfr/react-dsfr/Button";
import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Header } from "../components/atoms/Header";
import { Loader } from "../components/atoms/Icons";
import {
  Timeline,
  TimelineElement,
} from "../components/molecules/Timeline/Timeline";
import { Page } from "../components/organisms/Page";
import { Certification, Experience, duration } from "../interface";
import { MainContext, MainEvent } from "../machines/main.machine";
import { sortExperiences } from "../utils/experienceHelpers";
import { projectProgress } from "../utils/projectProgress";

interface ProjectHomeProps {
  isValidated: boolean;
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
  <li key={index} className="flex flex-col p-4 border border-dsfrBlue-500">
    <p data-test="project-home-experience-title" className="font-medium">
      {experience.title}
    </p>
    <p data-test="project-home-experience-duration">
      {durationToString[experience.duration]}
    </p>
  </li>
);

const SubmissionWarning = () => (
  <>
    <h3 className="my-10 text-center font-bold text-xl">Tout est prêt !</h3>
    <p className="text-red-800 leading-7 mb-10">
      Lorsque le projet est validé, il engage un financement automatique proposé
      dans le cadre de l'expérimentation à laquelle vous participez. Votre
      engagement à poursuivre est nécessaire et vous engage personnellement.
    </p>
  </>
);

export const ProjectHome = ({
  isValidated,
  certification,
  mainService,
}: ProjectHomeProps) => {
  const [state, send] = useActor(mainService);

  const selectedGoals = state.context.goals.filter((goal) => goal.checked);

  const isHomeReady =
    !state.matches({ projectHome: "fakeLoading" }) &&
    !state.matches({ projectHome: "loading" }) &&
    !state.matches({ projectHome: "retry" }) &&
    !state.matches("submissionHome");

  const sortedExperiences = sortExperiences(state.context.experiences);

  const progress = projectProgress(state.context);
  const isProjectComplete = progress === 100;

  const projectButtonHandler = () =>
    isValidated
      ? send("SUBMIT_PROJECT")
      : progress === 100
      ? send("VALIDATE_PROJECT")
      : send("OPEN_HELP");

  const EditContact = () => (
    <TimelineElement title="Vos informations de contact" status="editable">
      {() => (
        <>
          {state.context.contact?.phone && (
            <p data-test="project-home-contact-phone" className="mb-2">
              {state.context.contact?.phone}
            </p>
          )}
          {state.context.contact?.email && (
            <p data-test="project-home-contact-email">
              {state.context.contact?.email}
            </p>
          )}
        </>
      )}
    </TimelineElement>
  );

  const EditCertification = () => (
    <TimelineElement
      title="Votre diplôme"
      status={certification ? "editable" : "active"}
    >
      {({ status }) => (
        <>
          {certification && (
            <h3 data-test="certification-label" className="text-base mb-4">
              {certification?.label}
            </h3>
          )}

          {!isValidated && (
            <DsfrButton
              data-test="project-home-select-certification"
              priority="secondary"
              onClick={() => send("CLOSE_SELECTED_CERTIFICATION")}
              disabled={status === "disabled"}
            >
              {certification
                ? "Modifier votre diplôme"
                : "Choisir votre diplôme"}
            </DsfrButton>
          )}
        </>
      )}
    </TimelineElement>
  );

  const EditGoals = () => (
    <TimelineElement
      title="Vos objectifs"
      status={
        certification
          ? selectedGoals.length
            ? "editable"
            : "active"
          : "disabled"
      }
    >
      {({ status }) => (
        <>
          <ul className="mb-2 leading-tight">
            {selectedGoals.map((goal) => (
              <li className="mb-2" key={goal.id}>
                {goal.label}
              </li>
            ))}
          </ul>
          {!isValidated && (
            <DsfrButton
              data-test="project-home-edit-goals"
              priority="secondary"
              onClick={() => send("EDIT_GOALS")}
              disabled={status === "disabled"}
            >
              {selectedGoals.length > 0
                ? "Modifier vos objectifs"
                : "Choisir vos objectifs"}
            </DsfrButton>
          )}
        </>
      )}
    </TimelineElement>
  );

  const EditExperiences = () => (
    <TimelineElement
      title="Vos expériences"
      status={
        selectedGoals.length
          ? sortedExperiences.length
            ? "editable"
            : "active"
          : "disabled"
      }
    >
      {({ status }) => (
        <>
          {sortedExperiences.length > 0 && (
            <ul
              data-test="project-home-experiences"
              className="mb-2 pb-2 flex flex-col space-y-3"
            >
              {sortedExperiences.map(ExperienceSummary)}
            </ul>
          )}
          <div className="text-sm text-slate-400">
            {!isValidated && (
              <DsfrButton
                data-test="project-home-edit-experiences"
                priority="secondary"
                onClick={() => send("EDIT_EXPERIENCES")}
                disabled={status === "disabled"}
              >
                {sortedExperiences.length > 0
                  ? "Modifier vos expériences"
                  : "Choisir vos expériences"}
              </DsfrButton>
            )}
          </div>
        </>
      )}
    </TimelineElement>
  );

  const EditOrganism = () => (
    <TimelineElement
      title="Votre référent"
      description="Il vous guide tout au long du parcours"
      status={
        state.context.experiences.rest.length
          ? state.context.organism
            ? "editable"
            : "active"
          : "disabled"
      }
    >
      {({ status }) => (
        <>
          {state.context.organism && (
            <div className="flex flex-col p-4 border border-dsfrBlue-500">
              {state.context.organism?.label && (
                <h3
                  data-test="project-home-organism-label"
                  className="text-base font-medium"
                >
                  {state.context.organism?.label}
                </h3>
              )}
              <address className="not-italic">
                {state.context.organism?.address && (
                  <p data-test="project-home-organism-address">
                    {state.context.organism?.address}
                  </p>
                )}
                {state.context.organism?.zip && state.context.organism?.city && (
                  <p data-test="project-home-organism-zip-city">
                    {state.context.organism?.zip} {state.context.organism?.city}
                  </p>
                )}
                {state.context.organism?.contactAdministrativeEmail && (
                  <p data-test="project-home-organism-email">
                    {state.context.organism?.contactAdministrativeEmail}
                  </p>
                )}
              </address>
            </div>
          )}
          <div className="mt-4 text-sm text-slate-400">
            {!isValidated && (
              <DsfrButton
                data-test="project-home-edit-organism"
                priority="secondary"
                onClick={() => send("EDIT_ORGANISM")}
                disabled={status === "disabled"}
              >
                {state.context.organism
                  ? "Modifier votre référent"
                  : "Choisir votre référent"}
              </DsfrButton>
            )}
          </div>
        </>
      )}
    </TimelineElement>
  );

  const retryErrorScreen = (
    <div
      data-test="project-home-error"
      className="absolute ml-[-16px] mt-[-16px] lg:ml-[-64px] lg:mt-[-80px]  w-full  bg-neutral-100 h-full grow flex flex-col text-center items-center justify-center px-10"
    >
      <Header label="Oups..." size="small" />
      <p>{state.context.error}</p>
      <div className="mt-8">
        <Button
          data-test="submission-home-retry-candidate"
          size="small"
          label="Réessayer"
          onClick={() =>
            send({
              type: "SUBMIT_CERTIFICATION",
              certification,
            })
          }
        />
      </div>
    </div>
  );

  const loadingScreen = (
    <div
      data-test="project-home-loading"
      className="absolute ml-[-16px] mt-[-16px] lg:ml-[-64px] lg:mt-[-80px] w-full h-full flex flex-col bg-neutral-100 grow text-center items-center justify-center px-10"
    >
      <Header label="Connexion en cours" size="small" />
      <div className="mt-8 w-8">
        <Loader />
      </div>
    </div>
  );

  const homeScreen = (
    <div data-test={`project-home-${isValidated ? "validated" : "ready"}`}>
      <div>
        {!isValidated && (
          <>
            <Header label="Bienvenue" />
            <p className="my-4 pr-6 text-slate-600 text-lg">
              Reva est une expérimentation visant à simplifier la Validation des
              Acquis de l'Expérience (VAE). Vous avez une expérience dans les
              secteurs de la dépendance et de la santé ? Choisissez votre
              diplôme et laissez-vous accompagner !
            </p>
          </>
        )}
        {isValidated ? <SubmissionWarning /> : null}
        <Timeline className="mt-8" dataTest="project-home-timeline">
          <EditContact />
          <EditCertification />
          <EditGoals />
          <EditExperiences />
          <EditOrganism />
        </Timeline>
      </div>
      <div className="bg-white flex flex-col items-center pt-32 pb-12 sm:pb-4">
        <Button
          data-test={`project-home-${isValidated ? "submit" : "validate"}${
            !isProjectComplete ? "-locked" : ""
          }`}
          locked={!isProjectComplete}
          onClick={projectButtonHandler}
          type="submit"
          loading={state.matches("projectHome.submitting")}
          label={isValidated ? "Transmettre" : "Valider"}
          primary={isValidated}
          size="medium"
        />
      </div>
    </div>
  );

  return (
    <Page direction={state.context.direction}>
      {(state.matches({ projectHome: "loading" }) ||
        state.matches({ projectHome: "fakeLoading" })) &&
        loadingScreen}
      {state.matches({ projectHome: "retry" }) && retryErrorScreen}
      {isHomeReady && homeScreen}
    </Page>
  );
};
