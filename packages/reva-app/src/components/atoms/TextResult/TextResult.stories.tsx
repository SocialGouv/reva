import { ComponentStory, ComponentMeta } from "@storybook/react";

import { TextResult } from "./index";

export default {
  title: "Atoms/TextResult",
  component: TextResult,
  argTypes: {},
} as ComponentMeta<typeof TextResult>;

const Template: ComponentStory<typeof TextResult> = (args) => (
  <TextResult {...args} />
);

export const Dark = Template.bind({});

Dark.args = {
  title: "Résultat 1",
};

export const Light = Template.bind({});
Light.args = {
  title: "Résultat 1",
  color: "light",
};
