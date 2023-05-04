import {ReactNode} from "react";

export const BlueLayout = (props: {
  title?: string;
  description?: string;
  children?: ReactNode;
}) => (
  <div className="flex-1 flex flex-col relative">
    <div className="bg-gradient-to-r from-[#557AFF] to-[#2400FF] w-screen left-0 absolute z-0 pb-[400px]"></div>
    <div className="flex flex-col items-center z-1 relative pb-14 fr-container">
      <div className="w-4/6 py-8">
        <h1 className="text-white text-3xl">{props.title}</h1>
        <p className="text-white text-xl leading-relaxed mb-0">{props.description}</p>
      </div>
      <div className="bg-white drop-shadow-lg flex flex-col px-5 md:px-24 py-14">
        {props.children}
      </div>
    </div>
  </div>
);
