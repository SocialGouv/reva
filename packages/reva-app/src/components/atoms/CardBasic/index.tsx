import { FC } from "react";

interface Props {
  title: string;
  text?: string;
}

export const CardBasic: FC<Props> = ({ title, text, children }) => {
  return (
    <div className="rounded-xl px-8 py-6 bg-slate-400">
      <h2 className="text-slate-800 font-bold mb-2">{title}</h2>
      {children ? (
        children
      ) : (
        <div className="text-sm text-slate-900">{text}</div>
      )}
    </div>
  );
};
