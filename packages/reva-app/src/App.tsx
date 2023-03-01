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

  const { current, mainService } = useMainMachineContext();

  // @ts-ignore
  window.state = current;

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

      {current.matches("projectDroppedOut") &&
        projectDroppedOutPage(current.context.contact)}

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
    <div className="h-screen w-screen flex flex-col">
      <Header />
      <div className="flex-grow sm:flex sm:flex-col sm:items-center sm:justify-center ">
        <div className="sm:rounded-lg sm:shadow-lg sm:z-[1] md:my-5 relative flex flex-col w-full h-full max-w-[800px] bg-white overflow-hidden">
          {pageContent}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
