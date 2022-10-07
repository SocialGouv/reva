import { useActor } from "@xstate/react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Interpreter } from "xstate";

import { Header } from "../components/atoms/Header";
import { Select, option } from "../components/atoms/Select";
import { BackButton } from "../components/molecules/BackButton";
import { CandidateButton } from "../components/organisms/CandidateButton";
import { Card } from "../components/organisms/Card";
import { transitionIn } from "../components/organisms/Card/view";
import { CardSkeleton } from "../components/organisms/CardSkeleton";
import { Page } from "../components/organisms/Page";
import { Results } from "../components/organisms/Results";
import { buttonVariants } from "../config";
import { Certification } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface Props {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

export const Certificates = ({ mainService }: Props) => {
  const [state, send] = useActor(mainService);

  const resultsElement = useRef<HTMLDivElement | null>(null);
  const currentCertificateElement = useRef<HTMLLIElement | null>(null);

  const [chosenRegionCode, setChosenRegionCode] = useState(
    state.context.selectedRegion?.code
  );

  useEffect(() => {
    if (resultsElement.current && currentCertificateElement.current) {
      resultsElement.current.scrollTo(
        0,
        currentCertificateElement.current.offsetTop - 200
      );
    }
  }, []);

  const selectsOptionsRegions: option[] = state.context.regions
    .map((r) => ({
      label: r.label,
      value: r.code,
    }))
    .sort((a, b) => new Intl.Collator("fr").compare(a.label, b.label));

  const CertificateCard = (certification: Certification) => {
    const isSelected =
      state.matches("certificateSummary") &&
      (state.context.certification as Certification).id === certification.id;

    return (
      <Card
        ref={isSelected ? currentCertificateElement : null}
        initialSize={
          isSelected && state.context.direction === "previous"
            ? "open"
            : "reduced"
        }
        onOpen={() => send({ type: "SELECT_CERTIFICATION", certification })}
        onLearnMore={() =>
          send({ type: "SHOW_CERTIFICATION_DETAILS", certification })
        }
        onClose={() => send("CLOSE_SELECTED_CERTIFICATION")}
        key={certification.id}
        isSelectable={state.matches("searchResults")}
        id={certification.id}
        title={certification.label}
        label={certification.codeRncp}
        summary={certification.summary}
        status={certification.status}
      />
    );
  };

  function candidateButton() {
    const isVisible =
      state.matches("certificateSummary") || state.matches("submissionHome");
    const certification = state.context.certification as Certification;
    return (
      <motion.div
        className={`absolute bottom-0 z-50 inset-x-0 p-8 ${
          isVisible ? "bg-slate-900" : "transparent"
        }`}
        custom={state.toStrings().join("")}
        variants={buttonVariants}
        initial={false}
        exit="hidden"
        transition={
          isVisible ? { ...transitionIn, delay: 0.1 } : { duration: 0 }
        }
        animate={isVisible ? "visible" : "hidden"}
        layout="position"
      >
        {isVisible && (
          <CandidateButton
            candidacyId={state.context.candidacyId}
            certification={certification}
            send={send}
          />
        )}
      </motion.div>
    );
  }

  const displayCards = () => {
    if (state.matches("searchResultsError")) {
      return (
        <p key="error" className="text-red-600 mt-4 text-sm">
          {state.context.error}
        </p>
      );
    }
    if (state.matches("loadingCertifications")) {
      return [1, 2, 3, 4, 5].map((i) => (
        <CardSkeleton key={`skeleton-${i}`} size="small" />
      ));
    }

    return state.context.certifications.map(CertificateCard);
  };

  return (
    <Page
      data-test="certificates"
      className="z-40 bg-white"
      direction={state.context.direction}
    >
      <motion.div
        ref={resultsElement}
        layoutScroll
        className="h-full overflow-y-auto pb-12 pt-6"
      >
        <BackButton onClick={() => send("BACK")} />
        <div className="px-8 pt-16 sm:pt-4 bg-white">
          <Header label="Choisir mon diplôme" />
          <Select
            name="select_region"
            className="mt-8 mb-4"
            data-test="certificates-select-region"
            defaultValue={chosenRegionCode}
            placeholder="Ma Région"
            options={selectsOptionsRegions}
            onChangeHandler={(e) => {
              const el = e.target as HTMLOptionElement;
              const regionCode = el.value;
              setChosenRegionCode(regionCode);
              send({
                type: "SELECT_REGION",
                regionCode: regionCode,
              });
            }}
          />
        </div>
        {(!!chosenRegionCode || !!state.context.selectedRegion) && (
          <div className="px-8">
            <Results
              title={`Diplômes disponibles dans cette région`}
              listClassName="mb-4 space-y-8"
            >
              {displayCards()}
            </Results>
          </div>
        )}
      </motion.div>
      {candidateButton()}
    </Page>
  );
};
