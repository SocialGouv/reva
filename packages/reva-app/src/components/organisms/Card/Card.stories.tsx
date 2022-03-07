import { ComponentStory, ComponentMeta } from "@storybook/react";
import { loremIpsum } from "../../atoms/LoremIpsum";

import { Card } from "./index";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "organisms/Card",
  component: Card,
  argTypes: {},
} as ComponentMeta<typeof Card>;

const Template: ComponentStory<typeof Card> = (args) => <Card {...args} />;

export const Small = Template.bind({});

Small.args = {
  key: "1",
  description: loremIpsum,
  label: "N104c",
  title: "Licence Professionnelle Métiers du design",
};

export const Medium = Template.bind({});

Medium.args = {
  ...Small.args,
  initialSize: "medium",
};

export const Large = Template.bind({});

Large.args = {
  ...Small.args,
  initialSize: "large",
};
