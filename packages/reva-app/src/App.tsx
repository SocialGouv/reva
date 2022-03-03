import { Input } from "./components/atoms/Input";
import { Results } from "./components/organisms/Results";
import { TextResult } from "./components/atoms/TextResult";
import { BlockResult } from "./components/molecules/BlockResult";

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
          <Results title="Métiers">
            {[
              { key: "1", title: "Product Designer" },
              { key: "2", title: "UX Designer" },
              { key: "3", title: "Ui Designer" },
              { key: "4", title: "UX Researcher" },
            ].map(TextResult)}
          </Results>
          <Results title="Diplômes">
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
          </Results>
        </div>
      </div>
    </div>
  );
}

export default App;
