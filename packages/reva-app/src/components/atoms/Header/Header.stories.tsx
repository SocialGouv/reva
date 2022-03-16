import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";

import { Header } from "./index";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Atoms/Header",
  component: Header,
} as ComponentMeta<typeof Header>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Header> = (args) => <Header {...args} />;

export const HeaderDark = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
HeaderDark.args = {
  label: "Header dark",
};

export const HeaderLight = Template.bind({});
HeaderLight.args = {
  color: "light",
  label: "Header light",
};

export const HeaderDarkSmall = Template.bind({});
HeaderDarkSmall.args = {
  label: "Header dark small",
  size: "small",
};
