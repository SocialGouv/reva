import React from "react";
import logo from "./logo.svg";
import { Button } from "./components/atoms/Button";
import { Input } from "./components/atoms/Input";
import { ResultSection } from "./components/atoms/ResultSection";
import { TextResult } from "./components/atoms/TextResult";
import { BlockResult } from "./components/atoms/BlockResult";

function App() {
  return (
    <div className="App flex flex-col items-center justify-center h-screen bg-white bg-gray-400">
      <div className="max-w-lg w-full bg-white h-screen p-8">
        <Input
          name="search"
          type="search"
          placeholder="Métier, compétence"
          className="mb-4"
        />
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
  );
}

export default App;
