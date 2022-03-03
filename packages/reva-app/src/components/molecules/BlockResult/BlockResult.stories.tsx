import { ComponentStory, ComponentMeta } from "@storybook/react";

import { BlockResult } from "./index";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "molecules/BlockResult",
  component: BlockResult,
  argTypes: {},
} as ComponentMeta<typeof BlockResult>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof BlockResult> = (args) => (
  <BlockResult {...args} />
);

export const Dark = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Dark.args = {
  key: "1",
  label: "N104c",
  title: "Licence Professionnelle Métiers du design",
};
