import { ComponentMeta, ComponentStory } from "@storybook/react";

import { ProgressPage } from "./index";

export default {
  title: "organisms/ProgressPage",
  component: ProgressPage,
  argTypes: {},
} as ComponentMeta<typeof ProgressPage>;

const Template: ComponentStory<typeof ProgressPage> = (args) => (
  <ProgressPage {...args} />
);

export const NewPage = Template.bind({});

NewPage.args = {
  direction: "next",
};
