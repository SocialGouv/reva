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
      label: "5983",
      title:
        "Surveillant - visiteur de nuit en secteur social et médico-social",
    },
    {
      id: "2",
      description: loremIpsum,
      label: "13905",
      title: "Services aux personnes et aux territoires",
    },
    {
      id: "3",
      description: loremIpsum,
      label: "35028",
      title: "Agent de service médico-social",
    },
    {
      id: "4",
      description: loremIpsum,
      label: "35830",
      title: "Aide-Soignant",
    },
    {
      id: "5",
      description: loremIpsum,
      label: "34692",
      title: "Employé familial",
    },
    {
      id: "6",
      description: loremIpsum,
      label: "35506",
      title: "Assistant de vie aux familles",
    },
    {
      id: "7",
      description: loremIpsum,
      label: "34690",
      title: "Assistant de vie dépendance",
    },
    {
      id: "8",
      description: loremIpsum,
      label: "25467",
      title: "Diplôme d'État d'accompagnant éducatif et social",
    },
    {
      id: "9",
      description: loremIpsum,
      label: "17163",
      title: "Conducteur-e accompagnateur-e de personnes à mobilité réduite",
    },
    {
      id: "10",
      description: loremIpsum,
      label: "35993",
      title: "Responsable coordonnateur service au domicile",
    },
    {
      id: "11",
      description: loremIpsum,
      label: "34691",
      title: "Assistant maternel / garde d'enfants",
    },
    {
      id: "12",
      description: loremIpsum,
      label: "4500",
      title: "Assistant familial",
    },
    {
      id: "13",
      description: loremIpsum,
      label: "35832",
      title: "Auxiliaire de puériculture",
    },
    {
      id: "14",
      description: loremIpsum,
      label: "4503",
      title: "Technicien de l'intervention sociale et familiale",
    },
    {
      id: "15",
      description: loremIpsum,
      label: "2514",
      title:
        "Certificat d'aptitude aux fonctions d'encadrement et de responsable d'unité d'intervention sociale",
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
