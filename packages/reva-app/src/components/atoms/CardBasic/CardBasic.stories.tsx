import { ComponentMeta, ComponentStory } from "@storybook/react";

import { CardBasic } from ".";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Atoms/CardBasic",
  component: CardBasic,
} as ComponentMeta<typeof CardBasic>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof CardBasic> = (args) => (
  <CardBasic {...args} />
);

export const Basic = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Basic.args = {
  title: "Mon accompagnateur",
  text: "CNEAP Hauts de France",
};
