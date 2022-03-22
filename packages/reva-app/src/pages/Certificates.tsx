import { gql, useQuery } from "@apollo/client";
import { motion } from "framer-motion";
import { Just, Maybe, Nothing } from "purify-ts";
import { useEffect, useRef } from "react";

import { Button } from "../components/atoms/Button";
import { Header } from "../components/atoms/Header";
import { loremIpsumShort } from "../components/atoms/LoremIpsum";
import { Card } from "../components/organisms/Card";
import { transitionIn } from "../components/organisms/Card/view";
import { CardSkeleton } from "../components/organisms/CardSkeleton";
import { Navigation, Page } from "../components/organisms/Page";
import { Results } from "../components/organisms/Results";
import { buttonVariants } from "../config";
import { Certificate } from "../interface";

interface Certificates {
  maybeCurrentCertificate: Maybe<Certificate>;
  navigation: Navigation;
  setNavigationNext: (page: Page) => void;
  setCurrentCertificate: (certificate: Maybe<Certificate>) => void;
}

const SEARCH_CERTIFICATIONS_AND_PROFESSIONS = gql`
  query {
    searchCertificationsAndProfessions(query: "") {
      certifications {
        id
        label
        summary
        codeRncp
      }
    }
  }
`;

export const Certificates = ({
  maybeCurrentCertificate,
  navigation,
  setCurrentCertificate,
  setNavigationNext,
}: Certificates) => {
  const { loading, error, data } = useQuery(
    SEARCH_CERTIFICATIONS_AND_PROFESSIONS
  );

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

  const CertificateCard = (certificate: any) => {
    const isSelected = maybeCurrentCertificate
      .map((currentCertificate) => currentCertificate.id === certificate.id)
      .orDefault(false);

    return (
      <Card
        ref={isSelected ? currentCertificateElement : null}
        initialSize="small"
        isOpen={isSelected}
        onOpen={() => setCurrentCertificate(Just(certificate))}
        onLearnMore={() => setNavigationNext("show-certificate-details")}
        onClose={() => setCurrentCertificate(Nothing)}
        key={certificate.id}
        id={certificate.id}
        title={certificate.label}
        label={certificate.codeRncp}
        summary={certificate.summary}
      />
    );
  };

  function candidateButton(maybeCurrentCertificate: Maybe<Certificate>) {
    const isVisible = maybeCurrentCertificate.isJust();
    return (
      <motion.div
        className="absolute bottom-0 z-50 inset-x-0 p-8 bg-slate-900"
        custom={navigation.page}
        variants={buttonVariants}
        initial={false}
        exit="hidden"
        transition={
          isVisible
            ? { ...transitionIn, delay: 0.1 }
            : { ease: "easeOut", duration: 0.1 }
        }
        animate={isVisible ? "visible" : "hidden"}
        layout="position"
      >
        <Button
          onClick={() => setNavigationNext("load-submission")}
          label="Candidater"
          className="w-full"
          primary
          size="medium"
        />
      </motion.div>
    );
  }

  return (
    <Page className="z-40 bg-white" navigation={navigation}>
      <motion.div
        ref={resultsElement}
        layoutScroll
        className="h-full overflow-y-auto"
      >
        <div className="px-8 py-16 pb-8 lg:pt-8 bg-white">
          <Header label="Bienvenue" />
          <p className="mt-10 pr-6 text-slate-600 leading-loose text-lg">
            {loremIpsumShort}
          </p>
        </div>
        <div className="px-8">
          <Results
            title="Certifications disponibles"
            listClassName="mt-4 space-y-8"
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
      {candidateButton(maybeCurrentCertificate)}
    </Page>
  );
};
