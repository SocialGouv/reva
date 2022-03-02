import React from "react";
import logo from "./logo.svg";
import { Button } from "./components/atoms/Button";
import { Input } from "./components/atoms/Input";
import { ResultSection } from "./components/atoms/ResultSection";
import { TextResult } from "./components/atoms/TextResult";
import { BlockResult } from "./components/atoms/BlockResult";

function App() {
  return (
    <div className="App flex flex-col items-center justify-center h-screen bg-gray-400">
      <div className="flex flex-col max-w-lg w-full h-screen bg-white pt-16 lg:pt-8">
        <div className="px-8">
          <Input
            name="search"
            type="search"
            placeholder="Métier, compétence"
            className="mb-4"
          />
        </div>
        <div className="grow overflow-auto px-8">
          <ResultSection title="Métiers">
            {[
              { key: "1", title: "Product Designer" },
              { key: "2", title: "UX Designer" },
              { key: "3", title: "Ui Designer" },
              { key: "4", title: "UX Researcher" },
            ].map(TextResult)}
          </ResultSection>
          <ResultSection title="Diplômes">
            {[
              {
                key: "1",
                label: "N104c",
                title: "Licence Professionnelle Métiers du design",
              },
              {
                key: "2",
                label: "N304c",
                title: "MASTER Ergonomie",
              },
            ].map(BlockResult)}
          </ResultSection>
        </div>
      </div>
    </div>
  );
}

export default App;
