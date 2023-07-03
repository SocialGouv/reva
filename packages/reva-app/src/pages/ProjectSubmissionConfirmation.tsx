import Button from "@codegouvfr/react-dsfr/Button";
import { ErrorAlert } from "components/atoms/ErrorAlert/ErrorAlert";
import { BackToHomeButton } from "components/molecules/BackToHomeButton/BackToHomeButton";
import { Page } from "components/organisms/Page";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";

export const ProjectSubmissionConfirmation = () => {
  const { mainService } = useMainMachineContext();
  const { state } = useMainMachineContext();
  return (
    <Page title="Envoi de votre candidature">
      <BackToHomeButton />
      <h1 className="text-2xl text-black mt-6">Envoi de votre candidature</h1>
      {state.context.error ? (
        <ErrorAlert message={state.context.error} />
      ) : (
        <p className="mt-6">
          Après réception de votre candidature, votre organisme d'accompagnement
          vous contactera pour fixer un rendez-vous pour définir votre parcours.
        </p>
      )}
      <Button
        className="mt-6 justify-center w-[100%]  md:w-fit"
        data-test="project-submit"
        nativeButtonProps={{
          onClick: () => {
            mainService.send({
              type: "SUBMIT_PROJECT",
            });
          },
        }}
      >
        Envoyez ma candidature
      </Button>
    </Page>
  );
};
