import { useActor } from "@xstate/react";
import { ErrorAlertFromState } from "components/molecules/ErrorAlertFromState/ErrorAlertFromState";
import { ProjectTimeline } from "components/organisms/ProjectTimeline/ProjectTimeline";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Header } from "../components/atoms/Header";
import { Loader } from "../components/atoms/Icons";
import { NameBadge } from "../components/molecules/NameBadge/NameBadge";
import { Page } from "../components/organisms/Page";
import { Certification } from "../interface";
import { MainContext, MainEvent } from "../machines/main.machine";

interface ProjectHomeProps {
  certification: Certification;
  mainService: Interpreter<MainContext, any, MainEvent, any, any>;
}

export const ProjectHome = ({
  certification,
  mainService,
}: ProjectHomeProps) => {
  const [state, send] = useActor(mainService);

  const isHomeReady =
    !state.matches({ projectHome: "fakeLoading" }) &&
    !state.matches({ projectHome: "loading" }) &&
    !state.matches({ projectHome: "retry" });

  const retryErrorScreen = (
    <div
      data-test="project-home-error"
      className="absolute ml-[-16px] mt-[-16px] lg:ml-[-64px] lg:mt-[-80px]  w-full  bg-neutral-100 h-full grow flex flex-col text-center items-center justify-center px-10"
    >
      <Header label="Oups..." size="small" />
      <ErrorAlertFromState />
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
    <div data-test={`project-home-ready`}>
      <h1 className="text-lg font-bold text-dsfrGray-500">
        Bienvenue <span aria-hidden="true">🤝</span>,
      </h1>
      <NameBadge as="h2" className="mt-4" />
      <p className="my-4 pr-6 text-dsfrGray-500 text-base">
        Reva est une expérimentation visant à simplifier la Validation des
        Acquis de l'Expérience (VAE). Vous avez une expérience dans les secteurs
        de la dépendance et de la santé ? Choisissez votre diplôme et
        laissez-vous accompagner !
      </p>

      <ProjectTimeline className="mt-8" data-test="project-home-timeline" />
    </div>
  );

  return (
    <Page title="Démarrer et suivre votre VAE">
      {(state.matches({ projectHome: "loading" }) ||
        state.matches({ projectHome: "fakeLoading" })) &&
        loadingScreen}
      {state.matches({ projectHome: "retry" }) && retryErrorScreen}
      {isHomeReady && homeScreen}
    </Page>
  );
};
