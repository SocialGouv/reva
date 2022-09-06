import { useActor } from "@xstate/react";
import { AnimatePresence, motion } from "framer-motion";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Header } from "../components/atoms/Header";
import { Loader } from "../components/atoms/Icons";
import { ProgressTitle } from "../components/molecules/ProgressTitle";
import certificationImg from "../components/organisms/Card/certification.png";
import { Page } from "../components/organisms/Page";
import type { Certification } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";
import { projectProgress } from "../utils/projectProgress";

interface SubmissionHomeProps {
  candidacyCreatedAt: Date;
  certification: Certification;
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

const loadingScreen = (
  <motion.div
    key="loading-screen"
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="absolute flex flex-col bg-neutral-100 h-full"
  >
    <div className="grow flex flex-col text-center items-center justify-center px-10">
      <Header label="Création de votre candidature" size="small" />
      <div className="mt-8 w-8">
        <Loader />
      </div>
    </div>
  </motion.div>
);

const projectIntroduction = (progress: number, submit: () => void) => (
  <>
    <ProgressTitle progress={progress} title="Mon projet" />
    <p className="mt-5 text-sm text-gray-500 leading-loose">
      Cette étape consiste à compléter et à transmettre votre projet, vous serez
      ensuite recontacté sous 48h.
    </p>
    <div className="grow flex items-end mt-6">
      <div className="flex items-center">
        <Button
          data-test="submission-home-show-project-home"
          size="small"
          label="Compléter"
          onClick={submit}
        />
        <p className="ml-5 w-full text-sm text-gray-500">10 min</p>
      </div>
    </div>
  </>
);

const candidacyStatus = (
  <>
    <ProgressTitle
      progress={35}
      title={"Validation du projet"}
      theme={"dark"}
    />
    <p className="mt-3">Statut : transmis à un architecte de parcours</p>
    <p className="text-blue-500">Délai de réponse moyen 48h</p>
  </>
);

export const SubmissionHome = ({
  candidacyCreatedAt,
  certification,
  mainService,
}: SubmissionHomeProps) => {
  const [state, send] = useActor(mainService);

  const isHomeReady =
    !state.matches({ submissionHome: "loading" }) &&
    !state.matches({ submissionHome: "retry" });

  const isProjectDraft = state.context.projectStatus === "draft";

  const candidacyCreatedAtFormatted =
    candidacyCreatedAt?.toLocaleDateString("fr-FR");

  const retryErrorScreen = (
    <motion.div
      key="loading-screen"
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute flex flex-col bg-neutral-100 h-full"
    >
      <div className="grow flex flex-col text-center items-center justify-center px-10">
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
    </motion.div>
  );

  const homeContent = (
    <>
      <Header color="dark" label={certification.label} level={2} size="small" />
      <div className="-mt-2 mb-2 font-bold">{certification.codeRncp}</div>
      <p className="text-sm text-gray-500">
        Démarré le {candidacyCreatedAtFormatted}
      </p>
      {!isProjectDraft && (
        <p className="text-sm text-blue-500 font-medium">
          En attente de contact
        </p>
      )}
      <div
        className={`mt-10 flex flex-col px-8 py-6 rounded-xl shadow-sm ${
          isProjectDraft ? "bg-white" : "text-white bg-slate-900"
        }`}
        style={{ height: "414px" }}
      >
        {isProjectDraft
          ? projectIntroduction(projectProgress(state.context), () =>
              send("SHOW_PROJECT_HOME")
            )
          : candidacyStatus}
      </div>
    </>
  );

  const homeScreen = (
    <motion.div
      key="home-screen"
      className="flex flex-col h-full relative overflow-hidden"
      initial={
        state.context.direction === "next" ? { opacity: 0, y: 10 } : false
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
    >
      <img
        className="pointer-events-none"
        alt=""
        role="presentation"
        style={{
          position: "absolute",
          left: "-53px",
          top: "58px",
          width: "106px",
        }}
        src={certificationImg}
      />
      <h1 className="mt-12 -mb-12 text-center font-bold">Reva</h1>
      <div className="grow overflow-y-auto mt-36 px-8 pb-8">{homeContent}</div>
    </motion.div>
  );

  return (
    <Page
      className="z-50 flex flex-col bg-neutral-100"
      direction={state.context.direction}
    >
      <AnimatePresence>
        {state.matches({ submissionHome: "loading" }) && loadingScreen}
        {state.matches({ submissionHome: "retry" }) && retryErrorScreen}
        {isHomeReady && homeScreen}
      </AnimatePresence>
    </Page>
  );
};
