import { ApolloClient, getApolloContext } from "@apollo/client";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useMachine } from "@xstate/react";
import { AnimatePresence } from "framer-motion";
import { Just, Maybe, Nothing } from "purify-ts/Maybe";
import { useContext, useEffect, useMemo, useState } from "react";

import { Direction, Page } from "./components/organisms/Page";
import { Certification } from "./interface";
import { mainMachine } from "./machines/main.machine";
import { CertificateDetails } from "./pages/CertificateDetails";
import { Certificates } from "./pages/Certificates";
import { ProjectGoals } from "./pages/ProjectGoals";
import { ProjectHome } from "./pages/ProjectHome";
import {
  getCertification,
  searchCertifications,
} from "./services/searchServices";
import { SubmissionHome } from "./pages/SubmissionHome";
import useWindowSize from "./utils/useWindowSize";

function App() {
  const { client } = useContext(getApolloContext());
  const machine = useMemo(
    () =>
      mainMachine.withConfig({
        services: {
          searchCertifications: (context, event) =>
            searchCertifications(client as ApolloClient<object>)({ query: "" }),
          getCertification: (context, event) => {
            if (event.type !== "SELECT_CERTIFICATION") {
              return Promise.reject("Impossible state");
            }
            return getCertification(client as ApolloClient<object>)({
              id: event.certification.id,
            });
          },
        },
      }),
    [client]
  );

  const [current, send, mainService] = useMachine(machine);
  // @ts-ignore
  window.state = current;

  const windowSize = useWindowSize();

  const appSize =
    windowSize.width > 640
      ? { width: 480, height: windowSize.height * 0.85 }
      : windowSize;

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

  const submissionHomePage = (certificate: Certificate) => (
    <SubmissionHome key="project-home" mainService={mainService} certification={certification} />
  );

  const projectGoalsPage = (certification: Certification) => (
    <ProjectGoals key="project-goals" mainService={mainService} />
  );

  const projectHomePage = (certification: Certificate) => (
    <ProjectHome key="project-home" mainService={mainService} certification={certification} />
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
          {[
            "loadingCertifications",
            "searchResults",
            "searchResultsError",
            "certificateSummary",
          ].some(current.matches) && certificatesPage}

          {current.matches("submissionHome") &&
            submissionHomePage(
              (current.context.currentPage as SubmissionHomeState).certification
            )}

          {current.matches("projectGoals") &&
            projectGoalsPage(
              (current.context.currentPage as ProjectGoalsState).certification
            )}

          {current.matches("projectHome") &&
            projectHomePage(
              (current.context.currentPage as ProjectHomeState).certification
            )}

          {current.matches("certificateDetails") &&
            certificateDetails(
              (current.context.currentPage as CertificateDetailsState)
                .certification
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
