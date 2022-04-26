import { useActor } from "@xstate/react";
import { AnimatePresence, motion } from "framer-motion";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Header } from "../components/atoms/Header";
import { Loader } from "../components/atoms/Icons";
import { BackButton } from "../components/molecules/BackButton";
import { ProgressTitle } from "../components/molecules/ProgressTitle";
import certificationImg from "../components/organisms/Card/certification.png";
import { Page } from "../components/organisms/Page";
import type { Certification } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";
import { projectProgress } from "../utils/projectProgress";

interface SubmissionHome {
  certification: Certification;
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

export const SubmissionHome = ({
  certification,
  mainService,
}: SubmissionHome) => {
  const [state, send] = useActor(mainService);

  const homeLoaded = !state.matches({ submissionHome: "loading" });

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

  const homeContent = (
    <>
      <Header color="dark" label={certification.label} size="small" />
      <div className="-mt-2 mb-2 font-bold">{certification.codeRncp}</div>
      <p className="text-sm text-gray-450">Démarré le 10 janvier 2022</p>
      <div
        className="mt-10 flex flex-col px-8 py-6 rounded-xl bg-white shadow-sm"
        style={{ height: "414px" }}
      >
        <ProgressTitle
          progress={projectProgress(state.context)}
          title="Mon projet"
        />
        <p className="mt-5 text-sm text-gray-450 leading-loose">
          Cette étape consiste à compléter et à transmettre votre projet, vous
          serez ensuite recontacté sous 48h.
        </p>
        <div className="grow flex items-end mt-6">
          <div className="flex items-center">
            <Button
              data-test="submission-home-show-project-home"
              size="small"
              label="Compléter"
              onClick={() => send("SHOW_PROJECT_HOME")}
            />
            <p className="ml-5 w-full text-sm text-gray-500">10 min</p>
          </div>
        </div>
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
        style={{
          position: "absolute",
          left: "-53px",
          top: "58px",
          width: "106px",
        }}
        src={certificationImg}
      />
      <div className="mt-12 -mb-12 text-center font-bold">REVA</div>
      <div className="grow overflow-y-auto mt-36 px-8 pb-8">{homeContent}</div>
    </motion.div>
  );

  return (
    <Page
      className="z-50 flex flex-col bg-neutral-100"
      direction={state.context.direction}
    >
      <AnimatePresence>
        {!homeLoaded && loadingScreen}
        {homeLoaded && homeScreen}
      </AnimatePresence>
    </Page>
  );
};
