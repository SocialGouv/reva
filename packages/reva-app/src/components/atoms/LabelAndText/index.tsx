import { FC } from "react";

const Label: FC = ({ children }) => (
  <div className="text-slate-400">{children}</div>
);

const Text: FC = ({ children }) => (
  <div className="text-white font-bold">{children}</div>
);

interface Props {
  label: string;
  text: string | string[];
}

export const LabelAndText: FC<Props> = ({ label, text }) => (
  <div className="my-4">
    <Label>{label}</Label>
    {typeof text === "string" ? (
      <Text>{text}</Text>
    ) : (
      text.map((t, i) => <Text key={i}>{t}</Text>)
    )}
  </div>
);
