import { Capacitor } from "@capacitor/core";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Header } from "./components/atoms/Header";
import { loremIpsumShort } from "./components/atoms/LoremIpsum";
import { TextResult } from "./components/atoms/TextResult";
import { Card, CardSize } from "./components/organisms/Card";
import { CardSkeleton } from "./components/organisms/CardSkeleton";
import { Results } from "./components/organisms/Results";
import { certificateFixtures } from "./fixtures/certificates";
import { Certificate } from "./interface";

function App() {
  const emptyCertificates: Certificate[] = [];
  const [certificates, setCertificates] = useState(emptyCertificates);

  useEffect(() => {
    setTimeout(() => {
      setCertificates(certificateFixtures);
    }, 1000);
  });

  const initialPage = {
    type: "results",
  };

  const [page, setPage] = useState(initialPage);

  function certificateResults(initialSize: CardSize) {
    return certificates.length
      ? certificates.map((certificate) => (
          <Card
            initialSize={initialSize}
            key={certificate.id}
            {...certificate}
          />
        ))
      : [1, 2, 3, 4, 5].map((i) => (
          <CardSkeleton key={`skeleton-${i}`} size={initialSize} />
        ));
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

  return (
    <div className="App relative flex flex-col items-center justify-center h-screen bg-gray-400">
      {Capacitor.isNativePlatform() ? (
        <div className="absolute z-10 h-12 top-0 inset-x-0 backdrop-blur-md bg-white/50"></div>
      ) : (
        <></>
      )}
      <div className="relative flex flex-col max-w-lg w-full h-screen bg-white">
        <motion.div layoutScroll className="grow overflow-auto">
          {page.type === "results" ? resultsPage : certificatesPage}
        </motion.div>
      </div>
    </div>
  );
}

export default App;
