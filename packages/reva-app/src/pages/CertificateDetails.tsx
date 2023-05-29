import Button from "@codegouvfr/react-dsfr/Button";
import { BackButton } from "components/molecules/BackButton";
import { Page } from "components/organisms/Page";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";
import parse from "html-react-parser";
import { ReactNode, useMemo, useState } from "react";

const Section = ({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) => {
  return (
    <section>
      <h2 className="text-lg font-bold mb-6">{title}</h2>
      {children}
    </section>
  );
};

export const CertificateDetails = () => {
  const {
    state,
    mainService: { send },
  } = useMainMachineContext();
  const [showMore, setShowMore] = useState(false);
  const certification = useMemo(
    () => state.context.selectedCertification,
    [state.context.selectedCertification]
  );

  return certification ? (
    <Page title={`Détails de la certification ${certification.label}`}>
      <BackButton className="mb-6" />
      <h1 className="mb-4 text-2xl font-bold text-black">
        {certification.label}
      </h1>
      <h2 className="mb-6">
        Code RNCP: {state.context.selectedCertification?.codeRncp}
      </h2>
      <Section title="Objectif du diplôme">
        <p>{certification.summary}</p>
      </Section>
      {showMore && (
        <div className="flex flex-col gap-6 mt-6 mb-2">
          {certification.activities && (
            <Section title="Activités visées">
              <p>{parse(certification.activities)}</p>
            </Section>
          )}
          {certification.abilities && (
            <Section title="Compétences attestées">
              <p>{parse(certification.abilities)}</p>
            </Section>
          )}

          {certification.activityArea && (
            <Section title="Secteurs d'activités">
              <p>{parse(certification.activityArea)}</p>
            </Section>
          )}
          {certification.accessibleJobType && (
            <Section title="Types d'emplois accessibles">
              <p>{parse(certification.accessibleJobType)}</p>
            </Section>
          )}
        </div>
      )}
      <Button
        priority="tertiary no outline"
        className="p-0 mt-4"
        onClick={() => setShowMore((showMore) => !showMore)}
        nativeButtonProps={{
          "aria-expanded": showMore,
        }}
      >
        Lire {showMore ? "moins" : "plus"}
      </Button>
      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <Button
          data-test="submit-certification-button"
          className="justify-center w-[100%]  md:w-fit"
          onClick={() => send({ type: "SUBMIT_CERTIFICATION", certification })}
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
