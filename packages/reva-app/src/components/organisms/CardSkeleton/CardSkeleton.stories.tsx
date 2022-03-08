import { ComponentMeta, ComponentStory } from "@storybook/react";

import { loremIpsum } from "../../atoms/LoremIpsum";
import { CardSkeleton } from "./index";

export default {
  title: "organisms/CardSkeleton",
  component: CardSkeleton,
  argTypes: {},
} as ComponentMeta<typeof CardSkeleton>;

const Template: ComponentStory<typeof CardSkeleton> = (args) => (
  <CardSkeleton {...args} />
);

export const Small = Template.bind({});

Small.args = {};

export const Medium = Template.bind({});

Medium.args = {
  ...Small.args,
  size: "medium",
};

export const Large = Template.bind({});

Large.args = {
  ...Small.args,
  size: "large",
};
