import React from "react";

type Color = "dark" | "light";

interface HeaderProps {
  color: Color;
  label: string;
}

const colorClass = (color: Color) =>
  color === "dark" ? "text-gray-800" : "text-white";

/**
 * Primary UI component for user interaction
 */
export const Header = ({ color = "dark", label = "" }: HeaderProps) => (
  <h1 className={`${colorClass(color)} text-4xl`}>{label}</h1>
);
