import { ComponentMeta, ComponentStory } from "@storybook/react";

import { Description } from ".";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Atoms/LabelAndText",
  component: Description,
} as ComponentMeta<typeof Description>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Description> = (args) => (
  <Description {...args}>{args.children}</Description>
);

export const Basic = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Basic.args = {
  term: "Diplome visé",
  children: "Assistant",
};

export const Multiple = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Multiple.args = {
  term: "Diplome visé",
  children: (
    <ul>
      {[
        "Intitulé de formation",
        "Intitulé de formation",
        "Intitulé de formation",
      ].map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  ),
};
