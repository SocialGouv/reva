import { Crisp } from "crisp-sdk-web";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";

import { Footer } from "./components/organisms/Footer";
import { Header } from "./components/organisms/Header/Header";
import { useMainMachineContext } from "./contexts/MainMachineContext/MainMachineContext";
import { Certification, Contact } from "./interface";
import { CertificateDetails } from "./pages/CertificateDetails";
import { Certificates } from "./pages/Certificates";
import { Error } from "./pages/Error";
import { LoginConfirmation } from "./pages/LoginConfirmation";
import { LoginHome } from "./pages/LoginHome";
import { ProjectContact } from "./pages/ProjectContact";
import { ProjectContactConfirmation } from "./pages/ProjectContactConfirmation";
import { ProjectDroppedOut } from "./pages/ProjectDroppedOut";
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

function App() {
  useEffect(() => {
    const crispId = process.env.REACT_APP_CRISP_ID;
    crispId && Crisp.configure(crispId);
  }, []);

  const { state, mainService } = useMainMachineContext();

  // @ts-ignore
  window.state = state;

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

  const projectDroppedOutPage = (contact: Contact) => {
    const firstname = contact?.firstname ?? "";
    const lastname = contact?.lastname ?? "";
    const fullName = `${firstname} ${lastname}`;
    return (
      <ProjectDroppedOut
        mainService={mainService}
        candidateEmail={contact?.email ?? ""}
        candidateName={fullName}
        supportEmail="support@reva.beta.gouv.fr"
      />
    );
  };

  const errorPage = () => <Error key="error-page" mainService={mainService} />;

  const certificateDetails = (certification: Certification) => (
    <CertificateDetails
      key="show-certificate-details"
      mainService={mainService}
      certification={certification}
    />
  );

  const pageContent = (
    <AnimatePresence custom={state.context.direction} initial={false}>
      {[
        "loadingCertifications",
        "searchResults",
        "searchResultsError",
        "certificateSummary",
      ].some(state.matches) && certificatesPage}

      {state.matches("loginHome") && loginHomePage()}
      {state.matches("loginConfirmation") && loginConfirmationPage()}

      {state.matches("projectHome") &&
        projectHomePage({
          isValidated: ["CANDIDATURE_VALIDEE", "VALIDATION"].includes(
            state.context.candidacyStatus
          ),
          certification: state.context.certification,
        })}

      {state.matches("projectSubmitted") && projectSubmittedPage()}

      {state.matches("projectContact") && projectContactPage()}
      {state.matches("projectContactConfirmation") &&
        projectContactConfirmationPage()}

      {state.matches("projectExperiences") && projectExperiencesPage()}

      {state.matches("projectExperience") && projectExperiencePage()}

      {state.matches("projectGoals") &&
        projectGoalsPage(state.context.certification)}

      {state.matches("projectHelp") && projectHelpPage()}

      {state.matches("projectOrganism") &&
        projectOrganismsPage(state.context.certification)}

      {state.matches("projectDroppedOut") &&
        projectDroppedOutPage(state.context.contact)}

      {state.matches("certificateDetails") &&
        certificateDetails(state.context.certification)}

      {state.matches("submissionHome") &&
        submissionHomePage(
          state.context.certification,
          state.context.candidacyCreatedAt
        )}

      {state.matches("trainingProgramSummary") && (
        <TrainingProgramSummary
          key="training-program-summary"
          mainService={mainService}
        />
      )}

      {state.matches("trainingProgramConfirmed") && (
        <TrainingProgramConfirmed
          key="training-program-confirmed"
          certification={state.context.certification}
          candidacyCreatedAt={state.context.candidacyCreatedAt}
          direction={state.context.direction}
          organism={state.context.organism}
          mainService={mainService}
        />
      )}

      {state.matches("error") && errorPage()}
    </AnimatePresence>
  );

  return (
    <div className="h-screen w-screen flex flex-col overflow-auto">
      <Header />
      <div className="flex flex-1">
        <div className="bg-dsfrBlue-300 w-0 lg:w-[20%]" />
        <div className="relative flex flex-1 flex-col w-full">
          {pageContent}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
