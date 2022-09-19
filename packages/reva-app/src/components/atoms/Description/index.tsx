import { FC } from "react";

const Term: FC = ({ children }) => (
  <dt className="text-slate-400 mt-4">{children}</dt>
);

const Detail: FC = ({ children }) => (
  <dd className="text-white font-bold mb-4">{children}</dd>
);

interface Props {
  term: string;
}

export const Description: FC<Props> = ({ term, children }) => (
  <>
    <Term>{term}</Term>
    <Detail>{children}</Detail>
  </>
);
