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
import { Certificate, Certification } from "../interface";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface Certificates {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

const SEARCH_CERTIFICATIONS_AND_PROFESSIONS = gql`
  query Certifications($query: String!) {
    searchCertificationsAndProfessions(query: $query) {
      certifications {
        id
        label
        summary
        codeRncp
      }
    }
  }
`;

export const Certificates = ({ mainService }: Certificates) => {
  const { loading, error, data } = useQuery(
    SEARCH_CERTIFICATIONS_AND_PROFESSIONS,
    { variables: { query: "" } }
  );

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
            {error || loremIpsumShort}
          </p>
        </div>
        <div className="px-8">
          <Results
            title="Certifications disponibles"
            listClassName="my-4 space-y-8"
          >
            {loading
              ? [1, 2, 3, 4, 5].map((i) => (
                  <CardSkeleton key={`skeleton-${i}`} size="small" />
                ))
              : data.searchCertificationsAndProfessions.certifications.map(
                  CertificateCard
                )}
          </Results>
        </div>
      </motion.div>
      {candidateButton()}
    </Page>
  );
};
