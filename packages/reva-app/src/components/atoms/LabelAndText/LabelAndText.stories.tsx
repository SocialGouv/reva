import { ComponentMeta, ComponentStory } from "@storybook/react";

import { LabelAndText } from ".";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Atoms/LabelAndText",
  component: LabelAndText,
} as ComponentMeta<typeof LabelAndText>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof LabelAndText> = (args) => (
  <LabelAndText {...args} />
);

export const Basic = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Basic.args = {
  label: "Diplome visé",
  text: "Assistant",
};

export const Multiple = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Multiple.args = {
  label: "Diplome visé",
  text: [
    "Intitulé de formation",
    "Intitulé de formation",
    "Intitulé de formation",
  ],
};
