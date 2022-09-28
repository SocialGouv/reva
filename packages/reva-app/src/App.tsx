import { ApolloClient, getApolloContext } from "@apollo/client";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useMachine } from "@xstate/react";
import { AnimatePresence } from "framer-motion";
import { useContext, useEffect, useMemo } from "react";

import { Button } from "./components/atoms/Button";
import { Title } from "./components/atoms/Title";
import { PageCard } from "./components/molecules/PageCard";
import { PageHeaders } from "./components/molecules/PageHeaders";
import { ProgressPage } from "./components/organisms/ProgressPage";
import { Certification } from "./interface";
import { mainMachine } from "./machines/main.machine";
import { CertificateDetails } from "./pages/CertificateDetails";
import { Certificates } from "./pages/Certificates";
import { Error } from "./pages/Error";
import { ProjectContact } from "./pages/ProjectContact";
import { ProjectExperience } from "./pages/ProjectExperience";
import { ProjectExperiences } from "./pages/ProjectExperiences";
import { ProjectGoals } from "./pages/ProjectGoals";
import { ProjectHelp } from "./pages/ProjectHelp";
import { ProjectHome } from "./pages/ProjectHome";
import { ProjectOrganisms } from "./pages/ProjectOrganisms";
import { ProjectSubmitted } from "./pages/ProjectSubmitted";
import { SubmissionHome } from "./pages/SubmissionHome";
import { TrainingProgram } from "./pages/TrainingProgram";
import {
  addExperience,
  confirmTrainingForm,
  createCandidacyWithCertification,
  initializeApp,
  saveGoals,
  submitCandidacy,
  updateCertification,
  updateContact,
  updateExperience,
} from "./services/candidacyServices";
import {
  getOrganismsForCandidacy,
  setOrganismsForCandidacy,
} from "./services/organismServices";
import {
  getCertification,
  searchCertifications,
} from "./services/searchServices";
import useWindowSize from "./utils/useWindowSize";

function App() {
  const { client } = useContext(getApolloContext());
  const machine = useMemo(
    () =>
      mainMachine.withConfig({
        services: {
          searchCertifications: (context, event) => {
            return searchCertifications(client as ApolloClient<object>)({
              query: context.selectedRegion?.id || "",
            });
          },
          initializeApp: async (context, event) => {
            const deviceId = await Device.getId();
            return initializeApp(client as ApolloClient<object>)({
              deviceId: deviceId.uuid,
            });
          },
          getCertification: (context, event) => {
            if (event.type !== "SELECT_CERTIFICATION") {
              return Promise.reject("Impossible state");
            }
            return getCertification(client as ApolloClient<object>)({
              id: event.certification.id,
            });
          },
          getOrganisms: async (context, _event) => {
            if (!context.candidacyId)
              return Promise.reject(
                "unavailable candidacyId in XState context"
              );

            return getOrganismsForCandidacy(client as ApolloClient<object>)({
              query: context.candidacyId,
            });
          },
          saveCertification: async (context, event) => {
            if (
              event.type !== "SUBMIT_CERTIFICATION" ||
              !context.certification
            ) {
              return Promise.reject("Impossible state");
            }
            const deviceId = await Device.getId();

            return createCandidacyWithCertification(
              client as ApolloClient<object>
            )({
              deviceId: deviceId.uuid,
              certificationId: event.certification.id,
              regionId: context.selectedRegion?.id || "",
            }).then(
              (data) =>
                //TODO: maybe use an XState Delay ?
                new Promise((resolve) => setTimeout(() => resolve(data), 2000))
            );
          },
          updateCertification: async (context, event) => {
            if (
              event.type !== "SUBMIT_CERTIFICATION" ||
              !context.certification ||
              !context.candidacyId
            ) {
              return Promise.reject("Impossible state");
            }
            const deviceId = await Device.getId();

            return updateCertification(client as ApolloClient<object>)({
              deviceId: deviceId.uuid,
              candidacyId: context.candidacyId,
              certificationId: event.certification.id,
              regionId: context.selectedRegion?.id || "",
            });
          },
          setOrganismsForCandidacy: async (context, _event) => {
            if (!context.candidacyId || !context.organism?.id)
              return Promise.reject(
                "unavailable candidacyId or organism in XState context"
              );

            return setOrganismsForCandidacy(client as ApolloClient<object>)({
              candidacyId: context.candidacyId,
              organismId: context.organism.id,
            });
          },
          saveGoals: async (context, event) => {
            if (event.type !== "SUBMIT_GOALS" || !context.candidacyId) {
              return Promise.reject("Impossible state");
            }
            const deviceId = await Device.getId();
            await saveGoals(client as ApolloClient<object>)({
              deviceId: deviceId.uuid,
              candidacyId: context.candidacyId,
              goals: event.goals
                .filter((g) => g.checked)
                .map((g) => ({ goalId: g.id })),
            });
            return event.goals;
          },
          saveExperience: async (context, event) => {
            if (event.type !== "SUBMIT_EXPERIENCE" || !context.candidacyId) {
              return Promise.reject("Impossible state");
            }

            const deviceId = await Device.getId();

            if (!!event.experience.id) {
              const { id, ...experienceContent } = event.experience;
              return updateExperience(client as ApolloClient<object>)({
                deviceId: deviceId.uuid,
                candidacyId: context.candidacyId,
                experienceId: event.experience.id,
                experience: experienceContent,
              });
            } else {
              return addExperience(client as ApolloClient<object>)({
                deviceId: deviceId.uuid,
                candidacyId: context.candidacyId,
                experience: event.experience,
              });
            }
          },
          updateContact: async (context, event) => {
            if (event.type !== "SUBMIT_CONTACT" || !context.candidacyId) {
              return Promise.reject("Impossible state");
            }

            const deviceId = await Device.getId();
            return updateContact(client as ApolloClient<object>)({
              deviceId: deviceId.uuid,
              candidacyId: context.candidacyId,
              phone: event.contact.phone,
              email: event.contact.email,
            });
          },
          submitCandidacy: async (context, event) => {
            if (event.type !== "SUBMIT_PROJECT" || !context.candidacyId) {
              return Promise.reject("Impossible state");
            }

            const deviceId = await Device.getId();
            return submitCandidacy(client as ApolloClient<object>)({
              deviceId: deviceId.uuid,
              candidacyId: context.candidacyId,
            });
          },
          confirmTrainingForm: async (context, event) => {
            if (
              event.type !== "SUBMIT_TRAINING_PROGRAM" ||
              !context.candidacyId
            ) {
              return Promise.reject("Impossible state");
            }
            return confirmTrainingForm(client as ApolloClient<object>)({
              candidacyId: context.candidacyId,
            });
          },
        },
      }),
    [client]
  );

  const [current, , mainService] = useMachine(machine, { devTools: true });
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
    async function hideSplashscreen() {
      if (current.value !== "loadingApplicationData") {
        await SplashScreen.hide();
      }
    }
    Capacitor.isNativePlatform() && hideSplashscreen();
  }, [current.value]);

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

  const submissionHomePage = (
    certification: Certification,
    candidacyCreatedAt: Date
  ) => (
    <SubmissionHome
      key="submission-home"
      mainService={mainService}
      certification={certification}
      candidacyCreatedAt={candidacyCreatedAt}
    />
  );

  const projectGoalsPage = (certification: Certification) => (
    <ProjectGoals key="project-goals" mainService={mainService} />
  );

  const projectOrganismsPage = (certification: Certification) => (
    <ProjectOrganisms key="project-organism" mainService={mainService} />
  );

  const projectHelpPage = () => (
    <ProjectHelp key="project-help" mainService={mainService} />
  );

  const projectExperiencePage = () => (
    <ProjectExperience key="project-experience" mainService={mainService} />
  );

  const projectContactPage = () => (
    <ProjectContact key="project-contact" mainService={mainService} />
  );

  const projectExperiencesPage = () => (
    <ProjectExperiences key="project-experiences" mainService={mainService} />
  );

  const projectHomePage = ({
    isValidated,
    certification,
  }: {
    isValidated: boolean;
    certification: Certification;
  }) => (
    <ProjectHome
      key={`project-home${isValidated ? "-validated" : ""}}`}
      isValidated={isValidated}
      mainService={mainService}
      certification={certification}
    />
  );

  const projectSubmittedPage = () => (
    <ProjectSubmitted key="project-submitted" mainService={mainService} />
  );

  const errorPage = () => <Error key="error-page" mainService={mainService} />;

  const certificateDetails = (certification: Certification) => (
    <CertificateDetails
      key="show-certificate-details"
      mainService={mainService}
      certification={certification}
    />
  );

  const pageContent = (
    <AnimatePresence custom={current.context.direction} initial={false}>
      {[
        "loadingCertifications",
        "searchResults",
        "searchResultsError",
        "certificateSummary",
        "applicationDataLoaded",
      ].some(current.matches) && certificatesPage}

      {current.matches("projectHome") &&
        projectHomePage({
          isValidated: ["CANDIDATURE_VALIDEE", "VALIDATION"].includes(
            current.context.candidacyStatus
          ),
          certification: current.context.certification,
        })}

      {current.matches("projectSubmitted") && projectSubmittedPage()}

      {current.matches("projectContact") && projectContactPage()}

      {current.matches("projectExperiences") && projectExperiencesPage()}

      {current.matches("projectExperience") && projectExperiencePage()}

      {current.matches("projectGoals") &&
        projectGoalsPage(current.context.certification)}

      {current.matches("projectHelp") && projectHelpPage()}

      {current.matches("projectOrganism") &&
        projectOrganismsPage(current.context.certification)}

      {current.matches("certificateDetails") &&
        certificateDetails(current.context.certification)}

      {current.matches("submissionHome") &&
        submissionHomePage(
          current.context.certification,
          current.context.candidacyCreatedAt
        )}

      {current.matches("trainingProgramSummary") && (
        <TrainingProgram mainService={mainService} />
      )}

      {current.matches("trainingProgramConfirmed") && (
        <ProgressPage direction={current.context.direction}>
          <PageHeaders
            codeRncp={current.context.certification.codeRncp}
            title={current.context.certification.label}
            startDated={new Date(2022, 0, 10)}
          />
          <PageCard progress={100} title="Projet validé" theme="light">
            <section className="mt-7">
              <Title
                label="Mon parcours personnalisé"
                size={"small"}
                theme={"light"}
              />
              <div className="mt-3">Consultez de nouveau votre parcours</div>
              <div className="mt-3">
                <Button label="Voir mon parcours" size="tiny" />
              </div>
            </section>

            <section className="mt-7">
              <Title
                label="Mon architecte de parcours"
                size={"small"}
                theme={"light"}
              />
              <div className="text-md font-medium">
                {current.context.organism.label}
              </div>
              <address className="mt-1 text-gray-600">
                <div>{current.context.organism.address}</div>
                <div>
                  <span>{current.context.organism.zip}</span>
                  <span className="ml-2">{current.context.organism.city}</span>
                </div>
              </address>
              <div className="mt-1 text-gray-600">
                {current.context.organism.contactAdministrativeEmail}
              </div>
            </section>
          </PageCard>
        </ProgressPage>
      )}

      {current.matches("error") && errorPage()}
    </AnimatePresence>
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
        {!current.matches("loadingApplicationData") && pageContent}
      </div>
    </div>
  );
}

export default App;
