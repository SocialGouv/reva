import { useActor } from "@xstate/react";
import { ProjectTimeline } from "components/organisms/ProjectTimeline/ProjectTimeline";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Header } from "../components/atoms/Header";
import { Loader } from "../components/atoms/Icons";
import { NameBadge } from "../components/molecules/NameBadge/NameBadge";
import { Page } from "../components/organisms/Page";
import { Certification } from "../interface";
import { MainContext, MainEvent } from "../machines/main.machine";
import { projectProgress } from "../utils/projectProgress";

interface ProjectHomeProps {
  isValidated: boolean;
  certification: Certification;
  mainService: Interpreter<MainContext, any, MainEvent, any, any>;
}

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

  const isHomeReady =
    !state.matches({ projectHome: "fakeLoading" }) &&
    !state.matches({ projectHome: "loading" }) &&
    !state.matches({ projectHome: "retry" }) &&
    !state.matches("submissionHome");

  const progress = projectProgress(state.context);
  const isProjectComplete = progress === 100;

  const projectButtonHandler = () =>
    isValidated
      ? send("SUBMIT_PROJECT")
      : progress === 100
      ? send("VALIDATE_PROJECT")
      : send("OPEN_HELP");

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
            <h1 className="text-lg font-bold text-dsfrGray-500">
              Bienvenue 🤝,
            </h1>
            <NameBadge className="mt-4" />
            <p className="my-4 pr-6 text-dsfrGray-500 text-base">
              Reva est une expérimentation visant à simplifier la Validation des
              Acquis de l'Expérience (VAE). Vous avez une expérience dans les
              secteurs de la dépendance et de la santé ? Choisissez votre
              diplôme et laissez-vous accompagner !
            </p>
          </>
        )}
        {isValidated ? <SubmissionWarning /> : null}
        <ProjectTimeline
          isProjectValidated={isValidated}
          className="mt-8"
          dataTest="project-home-timeline"
        />
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
