import { FC } from "react";

interface Props {
  title: string;
  text?: string;
}

export const CardBasic: FC<Props> = ({ title, text, children }) => {
  return (
    <div className="rounded-xl p-6 mb-2 bg-slate-400">
      <h2 className="text-slate-800 text-xl font-bold mb-2">{title}</h2>
      {children ? children : <div className="text-base text-black">{text}</div>}
    </div>
  );
};
