import { ComponentMeta, ComponentStory } from "@storybook/react";

import { loremIpsum } from "../../atoms/LoremIpsum";
import { TextResult } from "../../atoms/TextResult";
import { Card, CardStatus } from "../../organisms/Card";
import { Results } from "./index";

export default {
  title: "Organisms/Results",
  component: Results,
  argTypes: {},
} as ComponentMeta<typeof Results>;

const TextTemplate: ComponentStory<typeof Results> = (args) => (
  <Results title="Métiers">
    {[
      { id: "1", title: "Product Designer" },
      { id: "2", title: "UX Designer" },
      { id: "3", title: "Ui Designer" },
      { id: "4", title: "UX Researcher" },
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
        id: "1",
        summary: loremIpsum,
        label: "N104c",
        title: "Licence Professionnelle Métiers du design",
        status: "AVAILABLE",
      },
      {
        id: "2",
        summary: loremIpsum,
        label: "N304c",
        title: "MASTER Ergonomie",
        status: "SOON",
      },
    ].map((certificate) => (
      <Card
        initialSize="reduced"
        key={certificate.id}
        id={certificate.id}
        isSelectable={true}
        title={certificate.label}
        label={certificate.label}
        summary={certificate.summary}
        status={certificate.status as CardStatus}
      />
    ))}
  </Results>
);

export const BlockResults = BlockTemplate.bind({});

BlockResults.args = {
  title: "Diplômes",
};
