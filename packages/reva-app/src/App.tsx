import { Capacitor } from "@capacitor/core";
import { StatusBar } from "@capacitor/status-bar";
import { AnimatePresence, motion } from "framer-motion";
import { Just, Maybe, Nothing } from "purify-ts/Maybe";
import { useEffect, useState } from "react";

import { Button } from "./components/atoms/Button";
import { Header } from "./components/atoms/Header";
import { Loader } from "./components/atoms/Icons";
import { loremIpsumShort } from "./components/atoms/LoremIpsum";
import { TextResult } from "./components/atoms/TextResult";
import { BackButton } from "./components/molecules/BackButton";
import { Card, CardSize } from "./components/organisms/Card";
import { transitionIn } from "./components/organisms/Card/view";
import { CardSkeleton } from "./components/organisms/CardSkeleton";
import { Results } from "./components/organisms/Results";
import { buttonVariants, pageTransition, pageVariants } from "./config";
import { certificateFixtures } from "./fixtures/certificates";
import { Certificate, Navigation } from "./interface";

function App() {
  const emptyCertificates: Certificate[] = [];
  const [certificates, setCertificates] = useState(emptyCertificates);
  const initialPage = "show-results";
  const initialNavigation: Navigation = {
    direction: "next",
    page: initialPage,
  };
  const [navigation, setNavigation] = useState<Navigation>(initialNavigation);

  const [maybeCurrentCertificate, setCurrentCertificate] =
    useState<Maybe<Certificate>>(Nothing);

  useEffect(() => {
    setTimeout(() => {
      setCertificates(certificateFixtures);
    }, 1000);
  }, []);

  useEffect(() => {
    async function setStatusBarVisibility() {
      if (
        navigation.page == "show-results" &&
        maybeCurrentCertificate.isJust()
      ) {
        await StatusBar.hide();
      } else {
        await StatusBar.show();
      }
    }
    Capacitor.isNativePlatform() && setStatusBarVisibility();
  }, [navigation.page, maybeCurrentCertificate]);

  function certificateResults(initialSize: CardSize) {
    return certificates.length
      ? certificates.map((certificate) => (
          <Card
            initialSize={initialSize}
            isOpen={maybeCurrentCertificate
              .map(
                (currentCertificate) => currentCertificate.id === certificate.id
              )
              .orDefault(false)}
            onOpen={() => setCurrentCertificate(Just(certificate))}
            onClose={() => setCurrentCertificate(Nothing)}
            key={certificate.id}
            {...certificate}
          />
        ))
      : [1, 2, 3, 4, 5].map((i) => (
          <CardSkeleton key={`skeleton-${i}`} size={initialSize} />
        ));
  }

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
          onClick={() =>
            setNavigation({ page: "load-submission", direction: "next" })
          }
          label="Candidater"
          className="w-full"
          primary
          size="medium"
        />
      </motion.div>
    );
  }

  const resultsPage = (
    <motion.div
      key="show-results"
      custom={navigation.direction}
      variants={pageVariants}
      initial="enter"
      animate="visible"
      exit="exit"
      transition={pageTransition}
      className="absolute z-40 inset-0 bg-white"
    >
      <motion.div layoutScroll className="h-full overflow-auto">
        <div className="px-8 py-16 pb-8 lg:pt-8 bg-white">
          <Header label="Bienvenue" />
          <p className="mt-10 pr-6 text-slate-600 leading-loose text-lg">
            {loremIpsumShort}
          </p>
        </div>
        <div className="px-8">
          <Results title="Diplômes" listClassName="mt-4 space-y-8">
            {certificateResults("small")}
          </Results>
        </div>
      </motion.div>
      {candidateButton(maybeCurrentCertificate)}
    </motion.div>
  );

  const certificatesPage = (
    <div className="px-8">
      <div className="mt-4 flex items-center justify-between">
        <TextResult title="Product Designer" />
        <button
          type="button"
          onClick={() =>
            setNavigation({ page: initialPage, direction: "previous" })
          }
          className="text-right text-lg p-6"
        >
          ←
        </button>
      </div>
      <Results title="Diplômes" listClassName="mt-4 space-y-8">
        {certificateResults("medium")}
      </Results>
    </div>
  );

  const loadSubmissionPage = (
    <motion.div
      key="load-submission"
      custom={navigation.direction}
      variants={pageVariants}
      initial="enter"
      animate="visible"
      exit="exit"
      transition={pageTransition}
      layoutScroll
      className="absolute z-50 inset-0 flex flex-col text-center bg-gray-100 h-full pt-8"
    >
      <BackButton
        onClick={() =>
          setNavigation({ page: "show-results", direction: "previous" })
        }
      />
      <div className="grow flex flex-col items-center justify-center">
        <Header label="Création de votre candidature" size="small" />
        <div className="mt-8 w-8">
          <Loader />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="App relative flex flex-col items-center justify-center h-screen bg-gray-400">
      {Capacitor.isNativePlatform() ? (
        <div className="absolute z-10 h-12 top-0 inset-x-0 backdrop-blur-md bg-white/50"></div>
      ) : (
        <></>
      )}
      <div className="relative flex flex-col max-w-lg w-full h-screen bg-white overflow-hidden">
        <AnimatePresence custom={navigation.direction} initial={false}>
          {navigation.page === "show-results"
            ? resultsPage
            : navigation.page === "load-submission"
            ? loadSubmissionPage
            : certificatesPage}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
