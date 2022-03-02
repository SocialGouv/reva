import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { Input } from "./index";

export default {
  title: "Atoms/Input",
  component: Input,

  argTypes: {
    backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof Input>;

const Template: ComponentStory<typeof Input> = (args) => <Input {...args} />;

export const Text = Template.bind({});
Text.args = {
  name: "text",
  placeholder: "Your name",
};

export const Search = Template.bind({});
Search.args = {
  name: "Search",
  placeholder: "Search...",
  type: "search",
};
