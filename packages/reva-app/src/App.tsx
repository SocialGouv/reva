import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import { Crisp } from "crisp-sdk-web";
import { CertificateDetails } from "pages/CertificateDetails";
import { ProjectSubmissionConfirmation } from "pages/ProjectSubmissionConfirmation";
import { useEffect } from "react";

import { Footer } from "./components/organisms/Footer";
import { Header } from "./components/organisms/Header/Header";
import { useMainMachineContext } from "./contexts/MainMachineContext/MainMachineContext";
import { Certification, Contact } from "./interface";
import { Certificates } from "./pages/Certificates";
import { Error } from "./pages/Error";
import { LoginConfirmation } from "./pages/LoginConfirmation";
import { LoginHome } from "./pages/LoginHome";
import { LogoutConfirmation } from "./pages/LogoutConfirmation";
import { ProjectContact } from "./pages/ProjectContact";
import { ProjectContactConfirmation } from "./pages/ProjectContactConfirmation";
import { ProjectDroppedOut } from "./pages/ProjectDroppedOut";
import { ProjectExperience } from "./pages/ProjectExperience";
import { ProjectGoals } from "./pages/ProjectGoals";
import { ProjectHome } from "./pages/ProjectHome";
import { ProjectOrganisms } from "./pages/ProjectOrganisms";
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

  const projectGoalsPage = () => (
    <ProjectGoals key="project-goals" mainService={mainService} />
  );

  const projectOrganismsPage = () => (
    <ProjectOrganisms key="project-organism" mainService={mainService} />
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

  const logoutConfirmationPage = () => (
    <LogoutConfirmation key="logout-confirmation" mainService={mainService} />
  );

  const projectContactPage = () => (
    <ProjectContact key="project-contact" mainService={mainService} />
  );

  const projectContactConfirmationPage = () => (
    <ProjectContactConfirmation key="project-contact-confirmation" />
  );

  const projectHomePage = ({
    certification,
  }: {
    certification: Certification;
  }) => (
    <ProjectHome
      key={`project-home-ready`}
      mainService={mainService}
      certification={certification}
    />
  );

  const projectDroppedOutPage = (contact: Contact) => {
    const firstname = contact?.firstname ?? "";
    const lastname = contact?.lastname ?? "";
    const fullName = `${firstname} ${lastname}`;
    return (
      <ProjectDroppedOut
        candidateEmail={contact?.email ?? ""}
        candidateName={fullName}
        supportEmail="support@vae.gouv.fr"
      />
    );
  };

  const errorPage = () => <Error key="error-page" mainService={mainService} />;

  const projectSubmissionConfirmationPage = () => (
    <ProjectSubmissionConfirmation />
  );

  const pageContent = (
    <>
      {["loadingCertifications", "searchResults", "searchResultsError"].some(
        state.matches
      ) && certificatesPage}

      {["certificateDetails", "submittingSelectedCertification"].some(
        state.matches
      ) && <CertificateDetails />}

      {state.matches("loginHome") && loginHomePage()}
      {state.matches("loginConfirmation") && loginConfirmationPage()}
      {state.matches("logoutConfirmation") && logoutConfirmationPage()}

      {state.matches("projectSubmissionConfirmation") &&
        projectSubmissionConfirmationPage()}

      {state.matches("projectContact") && projectContactPage()}
      {state.matches("projectContactConfirmation") &&
        projectContactConfirmationPage()}

      {state.matches("projectExperience") && projectExperiencePage()}

      {state.matches("projectGoals") && projectGoalsPage()}

      {state.matches("projectOrganism") && projectOrganismsPage()}

      {state.matches("projectDroppedOut") &&
        projectDroppedOutPage(state.context.contact)}

      {state.matches("trainingProgramSummary") && (
        <TrainingProgramSummary
          key="training-program-summary"
          mainService={mainService}
        />
      )}

      {state.matches("projectHome") || state.matches("trainingProgramConfirmed")
        ? projectHomePage({
            certification: state.context.certification,
          })
        : null}

      {state.matches("error") && errorPage()}
    </>
  );

  return (
    <div
      id="main-scroll"
      className="h-screen w-screen flex flex-col overflow-auto"
    >
      <SkipLinks
        links={[
          {
            anchor: "#content",
            label: "Contenu",
          },
          {
            anchor: "#footer",
            label: "Pied de page",
          },
        ]}
      />
      <Header />
      <div className="flex flex-1">
        <div className="bg-gradient-to-r from-[#557AFF] to-[#2400FF] w-0 lg:w-[25%]" />
        <main
          role="main"
          id="content"
          className="relative flex flex-1 flex-col w-full"
        >
          {pageContent}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;
