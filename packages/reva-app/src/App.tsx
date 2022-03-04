import { Input } from "./components/atoms/Input";
import { Results } from "./components/organisms/Results";
import { TextResult } from "./components/atoms/TextResult";
import { Card } from "./components/organisms/Card";
import { loremIpsum } from "./components/atoms/LoremIpsum";
import { motion, useMotionValue } from "framer-motion";

function App() {
  return (
    <div className="App flex flex-col items-center justify-center h-screen bg-gray-400">
      <div className="relative flex flex-col max-w-lg w-full h-screen bg-white">
        <motion.div layoutScroll className="grow overflow-auto">
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
                  description: loremIpsum,
                  label: "N104c",
                  title: "Licence Professionnelle Métiers du design",
                },
                {
                  key: "2",
                  description: loremIpsum,
                  label: "N304c",
                  title: "MASTER Ergonomie",
                },
                {
                  key: "3",
                  description: loremIpsum,
                  label: "N304c",
                  title: "MASTER Ergonomie",
                },
              ].map(Card)}
            </Results>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
