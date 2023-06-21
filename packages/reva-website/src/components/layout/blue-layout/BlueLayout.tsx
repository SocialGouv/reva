import { ReactNode } from "react";

export const BlueLayout = (props: {
  title?: string;
  description?: string | React.ReactNode;
  children?: ReactNode;
}) => (
  <div className="flex-1 flex flex-col relative">
    <div className="bg-gradient-to-r from-[#557AFF] to-[#2400FF] w-screen w-full pt-8 pb-16 md:pb-20 px-4 -mb-12">
      <div className="fr-container">
        <h1 className="text-white text-3xl">{props.title}</h1>
        {typeof props.description === "string" ? (
          <p className="text-white text-sm md:text-xl md:leading-relaxed mb-0">
            {props.description}
          </p>
        ) : (
          props.description
        )}
      </div>
    </div>
    <div className="flex flex-col items-center relative pb-14 fr-container">
      <div className="bg-white md:drop-shadow-lg flex flex-col px-5 md:px-24 pt-4 pb-6 md:py-14 mb-8">
        {props.children}
      </div>
    </div>
  </div>
);
