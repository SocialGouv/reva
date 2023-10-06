import { ReactNode } from "react";

export const FullHeightBlueLayout = (props: { children?: ReactNode }) => (
  <div className="flex-1 flex bg-gradient-to-r from-[#557AFF] to-[#2400FF]  p-0 md:p-16">
    <div className="max-w-none flex-1 bg-white flex flex-col p-2 md:p-16">
      {props.children}
    </div>
  </div>
);
