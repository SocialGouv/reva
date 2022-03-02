import React from "react";
import logo from "./logo.svg";
import { Button } from "./components/atoms/Button";
import { Input } from "./components/atoms/Input";
import { ResultSection } from "./components/atoms/ResultSection";

function App() {
  return (
    <div className="App flex flex-col items-center justify-center h-screen bg-white bg-gray-400">
      <div className="max-w-lg w-full bg-white h-screen p-8">
        <Input
          name="search"
          type="search"
          placeholder="Métier, compétence"
          className="mb-10"
        />
        <ResultSection
          title="Métiers"
          results={["Product Design", "UX Designer"]}
          renderResult={(item) => <span className="font-bold">{item}</span>}
        ></ResultSection>
      </div>
    </div>
  );
}

export default App;
