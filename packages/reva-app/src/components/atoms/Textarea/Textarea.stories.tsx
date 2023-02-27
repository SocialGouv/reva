import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";

import { loremIpsumLong } from "../LoremIpsum";
import { Textarea } from "./index";

export default {
  title: "Atoms/Textarea",
  component: Textarea,

  argTypes: {
    backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof Textarea>;

const Template: ComponentStory<typeof Textarea> = (args) => (
  <Textarea {...args} />
);

export const TextareaWithValue = Template.bind({});
TextareaWithValue.args = {
  defaultValue: loremIpsumLong,
  placeholder: "Your description",
  rows: 20,
};
