import { ComponentStory, ComponentMeta } from "@storybook/react";
import { BlockResult } from "../../molecules/BlockResult";
import { TextResult } from "../../atoms/TextResult";

import { Results } from "./index";

export default {
  title: "Organisms/Results",
  component: Results,
  argTypes: {},
} as ComponentMeta<typeof Results>;

const TextTemplate: ComponentStory<typeof Results> = (args) => (
  <Results title="Métiers">
    {[
      { key: "1", title: "Product Designer" },
      { key: "2", title: "UX Designer" },
      { key: "3", title: "Ui Designer" },
      { key: "4", title: "UX Researcher" },
    ].map(TextResult)}
  </Results>
);

export const TextResults = TextTemplate.bind({});

TextResults.args = {
  title: "Métiers",
};

const BlockTemplate: ComponentStory<typeof Results> = (args) => (
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
);

export const BlockResults = BlockTemplate.bind({});

BlockResults.args = {
  title: "Diplômes",
};
