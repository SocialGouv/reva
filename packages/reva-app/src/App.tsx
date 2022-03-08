import { Input } from "./components/atoms/Input";
import { Results } from "./components/organisms/Results";
import { TextResult } from "./components/atoms/TextResult";
import { Card } from "./components/organisms/Card";
import { loremIpsum } from "./components/atoms/LoremIpsum";
import { motion } from "framer-motion";
import { useState } from "react";

function App() {
  const jobs = [
    { id: "job-1", title: "Product Designer" },
    { id: "job-2", title: "UX Designer" },
    { id: "job-3", title: "Ui Designer" },
    { id: "job-4", title: "UX Researcher" },
  ];

  const certificates = [
    {
      id: "1",
      description: loremIpsum,
      label: "N104c",
      title: "Licence Professionnelle Métiers du design",
    },
    {
      id: "2",
      description: loremIpsum,
      label: "N304c",
      title: "MASTER Ergonomie",
    },
    {
      id: "3",
      description: loremIpsum,
      label: "N304c",
      title: "MASTER Ergonomie",
    },
  ];

  const initialPage = {
    type: "results",
    context: { job: jobs[0] },
  };

  const [page, setPage] = useState(initialPage);

  const resultsPage = (
    <>
      <div className="sticky z-10 top-0 px-8 pt-16 pb-1 lg:pt-8 bg-white">
        <Input
          name="search"
          type="search"
          placeholder="Métier, compétence"
          className="mb-4"
        />
      </div>
      <div className="px-8">
        <Results title="Métiers">
          {jobs.map((job) => (
            <TextResult
              key={job.id}
              onClick={() =>
                setPage({ type: "certificates", context: { job } })
              }
              {...job}
            />
          ))}
        </Results>
        <Results title="Diplômes" listClassName="mt-4 space-y-8">
          {certificates.map((certificate) => (
            <Card key={certificate.id} {...certificate} />
          ))}
        </Results>
      </div>
    </>
  );

  const certificatesPage = (
    <div className="px-8">
      <div className="mt-4 flex items-center justify-between">
        <TextResult title={page.context.job.title} />
        <button
          type="button"
          onClick={() => setPage(initialPage)}
          className="text-right text-lg p-6"
        >
          ←
        </button>
      </div>
      <Results title="Diplômes" listClassName="mt-4 space-y-8">
        {certificates.map((certificate) => (
          <Card key={certificate.id} initialSize="medium" {...certificate} />
        ))}
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
