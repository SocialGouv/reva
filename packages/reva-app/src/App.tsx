import { gql, useLazyQuery } from "@apollo/client";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useMachine } from "@xstate/react";
import { AnimatePresence } from "framer-motion";
import { Just, Maybe, Nothing } from "purify-ts/Maybe";
import { useEffect, useState } from "react";

import { Direction, Page } from "./components/organisms/Page";
import { Certificate, Certification } from "./interface";
import { mainMachine } from "./machines/main.machine";
import { CertificateDetails } from "./pages/CertificateDetails";
import { Certificates } from "./pages/Certificates";
import { ProjectGoals } from "./pages/ProjectGoals";
import { ProjectHome } from "./pages/ProjectHome";
import useWindowSize from "./utils/useWindowSize";

const GET_CERTIFICATE = gql`
  query Certification($id: ID!) {
    getCertification(id: $id) {
      id
      label
      summary
      codeRncp
      activities
      abilities
      activityArea
      accessibleJobType
    }
  }
`;

function App() {
  const [current, send, mainService] = useMachine(mainMachine);
  // @ts-ignore
  window.state = current;

  const windowSize = useWindowSize();

  const appSize =
    windowSize.width > 640
      ? { width: 480, height: windowSize.height * 0.85 }
      : windowSize;

  const [getCertification, { data }] = useLazyQuery(GET_CERTIFICATE);

  useEffect(() => {
    async function setStatusBarOverlay() {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setStyle({ style: Style.Light });
    }
    Capacitor.getPlatform() === "android" && setStatusBarOverlay();
  }, []);

  useEffect(() => {
    async function setStatusBarVisibility() {
      if (current.context.showStatusBar) {
        await StatusBar.hide();
      } else {
        await StatusBar.show();
      }
    }
    Capacitor.isNativePlatform() && setStatusBarVisibility();
  }, [current.context.showStatusBar]);

  const certificatesPage = (
    <Certificates key="show-results" mainService={mainService} />
  );

  const projectHomePage = (certification: Certification) => (
    <ProjectHome
      key="project-home"
      mainService={mainService}
      certification={certification}
    />
  );

  const projectGoalsPage = (certification: Certificate) => (
    <ProjectGoals key="project-goals" mainService={mainService} />
  );

  const certificateDetails = (certification: Certificate) => (
    <CertificateDetails
      key="show-certificate-details"
      mainService={mainService}
      certification={certification}
    />
  );

  return (
    <div className="App relative sm:flex sm:flex-col sm:items-center sm:justify-center sm:bg-slate-200 sm:h-screen sm:px-20">
      {Capacitor.isNativePlatform() ? (
        <div
          className={`transition-opacity duration-200 ${
            current.matches("searchResults") ? "opacity-1" : "opacity-0"
          } absolute z-50 h-12 top-0 inset-x-0 backdrop-blur-md bg-white/50`}
        ></div>
      ) : (
        <></>
      )}

      <div
        className="sm:rounded-2xl sm:z-[1] sm:shadow-xl relative flex flex-col w-full bg-white overflow-hidden"
        style={appSize}
      >
        <AnimatePresence custom={current.context.direction} initial={false}>
          {["searchResults", "certificateSummary"].some(current.matches) &&
            certificatesPage}

          {current.matches("projectHome") &&
            projectHomePage(current.context.certification)}

          {current.matches("projectGoals") &&
            projectGoalsPage(current.context.certification)}

          {current.matches("certificateDetails") &&
            certificateDetails(current.context.certification)}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
