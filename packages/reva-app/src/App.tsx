import React from "react";
import logo from "./logo.svg";
import { Button } from "./components/atoms/Button";
import { Input } from "./components/atoms/Input";

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
        <Button label="Candidater" onClick={() => {}} primary />
      </div>
    </div>
  );
}

export default App;
