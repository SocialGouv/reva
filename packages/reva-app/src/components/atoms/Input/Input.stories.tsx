import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";

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

export const TextWithLabel = Template.bind({});
TextWithLabel.args = {
  label: "Your name",
  name: "text",
  placeholder: "Alice",
};

export const DateWithLabel = Template.bind({});
DateWithLabel.args = {
  label: "Start date",
  name: "date",
  defaultValue: "2020-01-31",
  type: "date",
};

export const Search = Template.bind({});
Search.args = {
  name: "Search",
  placeholder: "Search...",
  type: "search",
};
