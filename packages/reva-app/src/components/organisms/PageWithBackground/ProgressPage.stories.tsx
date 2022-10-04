import { ComponentMeta, ComponentStory } from "@storybook/react";

import { PageWithBackground } from "./index";

export default {
  title: "organisms/PageWithBackground",
  component: PageWithBackground,
  argTypes: {},
} as ComponentMeta<typeof PageWithBackground>;

const Template: ComponentStory<typeof PageWithBackground> = (args) => (
  <PageWithBackground {...args} />
);

export const NewPage = Template.bind({});

NewPage.args = {
  direction: "next",
};
