import Button from "@codegouvfr/react-dsfr/Button";
import { BackButton } from "components/molecules/BackButton";
import { Page } from "components/organisms/Page";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";

export const CertificateDetails = () => {
  const {
    state,
    mainService: { send },
  } = useMainMachineContext();

  const selectedCertification = state.context.selectedCertification;

  return selectedCertification ? (
    <Page title={`Détails de la certification ${selectedCertification.label}`}>
      <BackButton className="mb-6" />
      <h1
        data-test="certification-label"
        className="mb-4 text-2xl font-bold text-black"
      >
        {selectedCertification.label}
      </h1>
      <h2 data-test="certification-code-rncp" className="mb-3">
        Code RNCP: {selectedCertification.codeRncp}
      </h2>
      <p>
        <a
          data-test="certification-more-info-link"
          target="_blank"
          rel="noreferrer"
          href={`https://www.francecompetences.fr/recherche/rncp/${selectedCertification.codeRncp}/`}
        >
          Lire les détails de la fiche diplôme
        </a>
      </p>
      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <Button
          data-test="submit-certification-button"
          className="justify-center w-[100%]  md:w-fit"
          onClick={() =>
            send({
              type: "SUBMIT_CERTIFICATION",
              certification: selectedCertification,
            })
          }
        >
          Choisir ce diplôme
        </Button>
        <Button
          priority="secondary"
          className="justify-center w-[100%]  md:w-fit"
          onClick={() => send("BACK")}
        >
          Retour
        </Button>
      </div>
    </Page>
  ) : null;
};
