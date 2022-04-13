import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";

import { Select } from "./index";

export default {
  title: "Atoms/Select",
  component: Select,
  argTypes: {
    backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof Select>;

const Template: ComponentStory<typeof Select> = (args) => <Select {...args} />;

export const SelectExample = Template.bind({});
SelectExample.args = {
  name: "select",
  label: "Select something",
  options: [
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
    { label: "Option 3", value: "3" },
  ],
};
