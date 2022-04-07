import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { useActor } from "@xstate/react";
import { motion } from "framer-motion";
import { Just, Maybe, Nothing } from "purify-ts";
import { useEffect, useRef } from "react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Header } from "../components/atoms/Header";
import { loremIpsumShort } from "../components/atoms/LoremIpsum";
import { Card } from "../components/organisms/Card";
import { transitionIn } from "../components/organisms/Card/view";
import { CardSkeleton } from "../components/organisms/CardSkeleton";
import { Direction, Page } from "../components/organisms/Page";
import { Results } from "../components/organisms/Results";
import { buttonVariants } from "../config";
import { Certification } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface Certificates {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

export const Certificates = ({ mainService }: Certificates) => {
  const [state, send] = useActor(mainService);

  const resultsElement = useRef<HTMLDivElement | null>(null);
  const currentCertificateElement = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    if (resultsElement.current && currentCertificateElement.current) {
      resultsElement.current.scrollTo(
        0,
        currentCertificateElement.current.offsetTop - 200
      );
    }
  }, []);

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
        onClose={
          () => send("CLOSE_SELECTED_CERTIFICATION")
          // () => closeCertification()
          // setNavigationNext(), setCurrentCertificate(Nothing)
          // setNavigationNext("search/results"), setCurrentCertificate(Nothing)
        }
        key={certification.id}
        id={certification.id}
        title={certification.label}
        label={certification.codeRncp}
        summary={certification.summary}
      />
    );
  };

  function candidateButton() {
    const isVisible = state.matches("certificateSummary");
    const certification = state.context.certification as Certification;
    return (
      <motion.div
        className="absolute bottom-0 z-50 inset-x-0 p-8 bg-slate-900"
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
        <Button
          onClick={() =>
            send({
              type: "CANDIDATE",
              certification,
            })
          }
          label="Candidater"
          className="w-full"
          primary
          size="large"
        />
      </motion.div>
    );
  }

  const displayCards = () => {
    if (["searchResultsError", "loadingCertifications"].some(state.matches)) {
      return [1, 2, 3, 4, 5]
        .map((i) => <CardSkeleton key={`skeleton-${i}`} size="small" />)
        .concat(
          <p key="error" className="text-red-600 mt-4 text-sm">
            {state.context.error}
          </p>
        )
        .reverse();
    } else if (
      // we test the state certificateSummary and certificateDetails to keep the animation from framer
      ["searchResults", "certificateSummary", "certificateDetails"].some(
        state.matches
      )
    ) {
      return state.context.certifications.map(CertificateCard);
    } else {
      return [];
    }
  };

  return (
    <Page className="z-40 bg-white" direction={state.context.direction}>
      <motion.div
        ref={resultsElement}
        layoutScroll
        className="h-full overflow-y-auto"
      >
        <div className="px-8 py-16 pb-8 lg:pt-8 bg-white">
          <Header label="Bienvenue" />
          <p className="mt-10 pr-6 text-slate-600 leading-loose text-lg">
            REVA est une expérimentation beta.gouv visant à simplifier la
            Validation des Acquis de l'Expérience (VAE). Sous l'impulsion du
            Ministère du Travail, cette nouvelle expérimentation REVA propose à
            3000 personnes, salariés du privé, aidants familiaux, demandeurs
            d'emploi, ayant une expérience dans le secteur du service à la
            personne, de la petite enfance ou de l'autonomie et de la santé
            d’obtenir une certification dans ce domaine.
          </p>
        </div>
        <div className="px-8">
          <Results
            title="Liste des certifications éligibles :"
            listClassName="my-4 space-y-8"
          >
            {displayCards()}
          </Results>
        </div>
      </motion.div>
      {candidateButton()}
    </Page>
  );
};
