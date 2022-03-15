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
import { transitionIn, transitionOut } from "./components/organisms/Card/view";
import { CardSkeleton } from "./components/organisms/CardSkeleton";
import { Results } from "./components/organisms/Results";
import { certificateFixtures } from "./fixtures/certificates";
import { Certificate } from "./interface";

type Page = "show-results" | "load-submission";

function App() {
  const emptyCertificates: Certificate[] = [];
  const [certificates, setCertificates] = useState(emptyCertificates);
  const initialPage = "show-results";
  const [page, setPage] = useState<Page>(initialPage);
  const [maybeCurrentCertificate, setCurrentCertificate] =
    useState<Maybe<string>>(Nothing);

  useEffect(() => {
    setTimeout(() => {
      setCertificates(certificateFixtures);
    }, 1000);
  });

  useEffect(() => {
    async function setStatusBarVisibility() {
      if (page == "show-results" && maybeCurrentCertificate.isJust()) {
        await StatusBar.hide();
      } else {
        await StatusBar.show();
      }
    }
    Capacitor.isNativePlatform() && setStatusBarVisibility();
  }, [page, maybeCurrentCertificate]);

  function certificateResults(initialSize: CardSize) {
    return certificates.length
      ? certificates.map((certificate) => (
          <Card
            initialSize={initialSize}
            onOpen={() => setCurrentCertificate(Just(certificate.id))}
            onClose={() => setCurrentCertificate(Nothing)}
            key={certificate.id}
            {...certificate}
          />
        ))
      : [1, 2, 3, 4, 5].map((i) => (
          <CardSkeleton key={`skeleton-${i}`} size={initialSize} />
        ));
  }

  const buttonVariants = {
    hidden: { y: 120, scale: 0.98, opacity: 1 },
    visible: { y: 0, scale: 1, opacity: 1 },
  };

  function candidateButton(maybeCurrentCertificate: Maybe<string>) {
    const isVisible = maybeCurrentCertificate.isJust();
    return (
      <motion.div
        className="absolute bottom-0 z-50 inset-x-0 p-8 bg-slate-900"
        variants={buttonVariants}
        initial="hidden"
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
          onClick={() => setPage("load-submission")}
          label="Candidater"
          className="w-full"
          primary
          size="medium"
        />
      </motion.div>
    );
  }

  const resultsPage = (
    <>
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
        {candidateButton(maybeCurrentCertificate)}
      </div>
    </>
  );

  const certificatesPage = (
    <div className="px-8">
      <div className="mt-4 flex items-center justify-between">
        <TextResult title="Product Designer" />
        <button
          type="button"
          onClick={() => setPage(initialPage)}
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

  const loadingSubmissionPage = (
    <div className="flex flex-col text-center bg-gray-100 h-full pt-8">
      <BackButton
        onClick={() => (
          setCurrentCertificate(Nothing), setPage("show-results")
        )}
      />
      <div className="grow flex flex-col items-center justify-center">
        <Header label="Création de votre candidature" size="small" />
        <div className="mt-8 w-8">
          <Loader />
        </div>
      </div>
    </div>
  );

  return (
    <div className="App relative flex flex-col items-center justify-center h-screen bg-gray-400">
      {Capacitor.isNativePlatform() ? (
        <div className="absolute z-10 h-12 top-0 inset-x-0 backdrop-blur-md bg-white/50"></div>
      ) : (
        <></>
      )}
      <div className="relative flex flex-col max-w-lg w-full h-screen bg-white overflow-hidden">
        <motion.div layoutScroll className="grow overflow-auto">
          {page === "show-results"
            ? resultsPage
            : page === "load-submission"
            ? loadingSubmissionPage
            : certificatesPage}
        </motion.div>
      </div>
    </div>
  );
}

export default App;
