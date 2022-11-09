import { ApolloClient, getApolloContext } from "@apollo/client";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import { useMachine } from "@xstate/react";
import { AnimatePresence } from "framer-motion";
import { useContext, useMemo } from "react";

import { Footer } from "./components/organisms/Footer";
import { useKeycloakContext } from "./contexts/keycloakContext";
import { Certification } from "./interface";
import { mainMachine } from "./machines/main.machine";
import { CertificateDetails } from "./pages/CertificateDetails";
import { Certificates } from "./pages/Certificates";
import { Error } from "./pages/Error";
import { LoginConfirmation } from "./pages/LoginConfirmation";
import { LoginHome } from "./pages/LoginHome";
import { ProjectContact } from "./pages/ProjectContact";
import { ProjectContactConfirmation } from "./pages/ProjectContactConfirmation";
import { ProjectExperience } from "./pages/ProjectExperience";
import { ProjectExperiences } from "./pages/ProjectExperiences";
import { ProjectGoals } from "./pages/ProjectGoals";
import { ProjectHelp } from "./pages/ProjectHelp";
import { ProjectHome } from "./pages/ProjectHome";
import { ProjectOrganisms } from "./pages/ProjectOrganisms";
import { ProjectSubmitted } from "./pages/ProjectSubmitted";
import { SubmissionHome } from "./pages/SubmissionHome";
import { TrainingProgramConfirmed } from "./pages/TrainingProgramConfirmed";
import { TrainingProgramSummary } from "./pages/TrainingProgramSummary";
import {
  addExperience,
  askForLogin,
  askForRegistration,
  confirmRegistration,
  confirmTrainingForm,
  getCandidateWithCandidacy,
  saveGoals,
  submitCandidacy,
  updateCertification,
  updateContact,
  updateExperience,
} from "./services/candidacyServices";
import {
  getOrganismsForCandidacy,
  selectOrganismForCandidacy,
} from "./services/organismServices";
import {
  getCertification,
  searchCertifications,
} from "./services/searchServices";
import useWindowSize from "./utils/useWindowSize";

function App() {
  const { client } = useContext(getApolloContext());
  //@ts-ignore
  const { authenticated, token, setTokens } = useKeycloakContext();

  const machine = useMemo(
    () =>
      mainMachine(authenticated).withConfig({
        services: {
          searchCertifications: (context, _event) => {
            return searchCertifications(client as ApolloClient<object>)({
              query: context.selectedDepartment?.id || "",
            });
          },
          initializeApp: async (_context, _event, { data }) => {
            if (authenticated) {
              const data = await getCandidateWithCandidacy(
                client as ApolloClient<object>
              )({ token });
              return data;
            } else {
              const { tokens, ...rest } = await confirmRegistration(
                client as ApolloClient<object>
              )({
                token: data.loginToken,
              });
              setTokens(tokens);
              return rest;
            }
          },
          getCertification: (_context, event) => {
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
              departmentId: context.selectedDepartment?.id || "",
            });
          },
          setOrganismsForCandidacy: async (context, _event) => {
            if (!context.candidacyId || !context.organism?.id)
              return Promise.reject(
                "unavailable candidacyId or organism in XState context"
              );

            return selectOrganismForCandidacy(client as ApolloClient<object>)({
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
          askForLogin: async (context, event) => {
            if (event.type !== "SUBMIT_LOGIN") {
              return Promise.reject("Impossible state");
            }

            return askForLogin(client as ApolloClient<object>)(event.login);
          },
          askForRegistration: async (context, event) => {
            if (event.type !== "SUBMIT_CONTACT") {
              return Promise.reject("Impossible state");
            }

            return askForRegistration(client as ApolloClient<object>)(
              event.contact
            );
          },
          updateContact: async (context, event) => {
            if (event.type !== "UPDATE_CONTACT" || !context.candidacyId) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client]
  );

  const [current, , mainService] = useMachine(machine, { devTools: true });
  // @ts-ignore
  window.state = current;

  const windowSize = useWindowSize();

  const appSize =
    windowSize.width > 640
      ? { width: 580, height: windowSize.height - 110 }
      : // On mobile, for form pages it's better to keep 100vh (touching an input moves the view up)
      ["loginHome", "projectExperience", "projectContact"].some(current.matches)
      ? { width: windowSize.width, height: "100vh" }
      : // Otherwise we use this height to prevent buttons fixed at the bottom to be hidden behind Safari bar
        windowSize;

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

  const loginHomePage = () => (
    <LoginHome key="login-home" mainService={mainService} />
  );

  const loginConfirmationPage = () => (
    <LoginConfirmation key="login-confirmation" mainService={mainService} />
  );

  const projectContactPage = () => (
    <ProjectContact key="project-contact" mainService={mainService} />
  );

  const projectContactConfirmationPage = () => (
    <ProjectContactConfirmation
      key="project-contact-confirmation"
      mainService={mainService}
    />
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
      key={`project-home-${isValidated ? "validated" : "ready"}}`}
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
      ].some(current.matches) && certificatesPage}

      {current.matches("loginHome") && loginHomePage()}
      {current.matches("loginConfirmation") && loginConfirmationPage()}

      {current.matches("projectHome") &&
        projectHomePage({
          isValidated: ["CANDIDATURE_VALIDEE", "VALIDATION"].includes(
            current.context.candidacyStatus
          ),
          certification: current.context.certification,
        })}

      {current.matches("projectSubmitted") && projectSubmittedPage()}

      {current.matches("projectContact") && projectContactPage()}
      {current.matches("projectContactConfirmation") &&
        projectContactConfirmationPage()}

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
        <TrainingProgramSummary
          key="training-program-summary"
          mainService={mainService}
        />
      )}

      {current.matches("trainingProgramConfirmed") && (
        <TrainingProgramConfirmed
          key="training-program-confirmed"
          certification={current.context.certification}
          candidacyCreatedAt={current.context.candidacyCreatedAt}
          direction={current.context.direction}
          organism={current.context.organism}
          mainService={mainService}
        />
      )}

      {current.matches("error") && errorPage()}
    </AnimatePresence>
  );

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-grow sm:flex sm:flex-col sm:items-center sm:justify-center">
        <div className="App relative sm:px-20">
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
            className="sm:rounded-lg sm:shadow-lg sm:z-[1] relative flex flex-col w-full bg-white overflow-hidden"
            style={appSize}
          >
            {pageContent}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
