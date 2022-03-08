import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Header } from "./components/atoms/Header";
import { loremIpsum, loremIpsumShort } from "./components/atoms/LoremIpsum";
import { TextResult } from "./components/atoms/TextResult";
import { Card, CardSize } from "./components/organisms/Card";
import { CardSkeleton } from "./components/organisms/CardSkeleton";
import { Results } from "./components/organisms/Results";

function App() {
  interface Certificate {
    id: string;
    description: string;
    label: string;
    title: string;
  }

  const certificateFixtures: Certificate[] = [
    {
      id: "1",
      description: loremIpsum,
      label: "N104c",
      title: "Agent.e de Service Médico-Social (ASMS)",
    },
    {
      id: "2",
      description: loremIpsum,
      label: "N304c",
      title: "Assistant.e De Vie aux Familles (ADVF)",
    },
    {
      id: "3",
      description: loremIpsum,
      label: "N304c",
      title: "Accompagnant.e éducatif et social (DEAES)",
    },
    {
      id: "4",
      description: loremIpsum,
      label: "N304c",
      title:
        "Conducteur.trice accompagnateur.trice de personnes à mobilité réduite (CaPmr)",
    },
    {
      id: "5",
      description: loremIpsum,
      label: "N304c",
      title: "Employé.e familial polyvalent.e",
    },
    {
      id: "6",
      description: loremIpsum,
      label: "N304c",
      title: "Assistant.e de vie dépendance",
    },
    {
      id: "7",
      description: loremIpsum,
      label: "N304c",
      title: "Accompagnant.e en gérontologie",
    },
  ];

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
      : Array(5).fill(<CardSkeleton size={initialSize} />);
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
    <div className="App flex flex-col items-center justify-center h-screen bg-gray-400">
      <div className="relative flex flex-col max-w-lg w-full h-screen bg-white">
        <motion.div layoutScroll className="grow overflow-auto">
          {page.type === "results" ? resultsPage : certificatesPage}
        </motion.div>
      </div>
    </div>
  );
}

export default App;
