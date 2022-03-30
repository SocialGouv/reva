import { ComponentMeta, ComponentStory } from "@storybook/react";

import { Checkbox } from "./index";

export default {
  title: "Atoms/Checkbox",
  component: Checkbox,
} as ComponentMeta<typeof Checkbox>;

const Template: ComponentStory<typeof Checkbox> = (args) => (
  <Checkbox {...args} />
);

export const CheckboxExample = Template.bind({});

CheckboxExample.args = {
  name: "other",
  label: "Autre",
};
