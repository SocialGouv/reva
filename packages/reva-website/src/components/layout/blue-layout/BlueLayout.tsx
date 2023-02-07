import React from "react";
import { ReactNode } from "react";

export const BlueLayout = (props: {
  title?: string;
  description?: string;
  children?: ReactNode;
}) => (
  <div className="flex-1 flex flex-col relative">
    <div className="bg-blue-900 w-screen left-0 absolute z-0 pb-[400px]"></div>
    <div className="flex flex-col items-center z-1 relative pb-14">
      <div className="fr-container py-5">
        <h2 className="text-white">{props.title}</h2>
        <p className="text-white">{props.description}</p>
      </div>
      <div className="bg-white drop-shadow-lg flex flex-col px-24 py-14">
        {props.children}
      </div>
    </div>
  </div>
);
