import { FC, ReactNode } from "react";

import { ProgressTitle } from "../../../components/molecules/ProgressTitle";

interface Props {
  progress: number;
  title: string;
  theme: "dark" | "light";
  children?: ReactNode;
}

export const ProgressCard: FC<Props> = ({
  progress,
  title,
  theme,
  children,
}) => {
  return (
    <div className="mt-6 flex flex-col px-8 py-6 rounded-xl shadow-sm bg-white">
      <section data-test="progress-100">
        <ProgressTitle progress={progress} title={title} theme={theme} />
      </section>
      {children}
    </div>
  );
};
