import { FC } from "react";

import { Add } from "../Icons";

interface Props {
  bgColor?: string;
}

export const ButtonRound: FC<Props> = ({ bgColor: color = "bg-blue-500" }) => {
  return (
    <div
      aria-hidden="true"
      className={`mt-4 rounded-full flex items-center justify-center h-[46px] w-[46px] ${color}`}
    >
      <div className="w-[18px]">
        <Add className="stroke-black" />
      </div>
    </div>
  );
};
