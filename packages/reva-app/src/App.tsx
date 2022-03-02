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
      <div className="flex flex-col max-w-lg w-full h-screen bg-white pt-8">
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
              { title: "Product Designer" },
              { title: "UX Designer" },
              { title: "Ui Designer" },
              { title: "UX Researcher" },
            ].map(TextResult)}
          </ResultSection>
          <ResultSection title="Diplômes">
            {[
              { label: "N104c", title: "Assistante de vie aux familles" },
              { label: "N104c", title: "Assistante de vie aux familles" },
            ].map(BlockResult)}
          </ResultSection>
        </div>
      </div>
    </div>
  );
}

export default App;
