import { FC } from "react";

import { ProgressTitle } from "../../../components/molecules/ProgressTitle";

interface Props {
  progress: number;
  title: string;
  theme: "dark" | "light";
}

export const PageCard: FC<Props> = ({ progress, title, theme, children }) => {
  return (
    <div
      className="mt-10 flex flex-col px-8 py-6 rounded-xl shadow-sm bg-white"
      style={{ height: "414px" }}
    >
      <ProgressTitle progress={progress} title={title} theme={theme} />
      <section>{children}</section>
    </div>
  );
};
