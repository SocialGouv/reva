import { FC } from "react";

const Term: FC = ({ children }) => (
  <dt className="text-slate-400 mt-4">{children}</dt>
);

const Detail: FC = ({ children }) => (
  <dd className="text-white font-bold mb-4">{children}</dd>
);

interface Props {
  term: string;
  detail: string | string[];
}

export const Description: FC<Props> = ({ term, detail }) => (
  <>
    <Term>{term}</Term>
    <Detail>
      {typeof detail === "string" ? (
        detail
      ) : (
        <ul>
          {detail.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      )}
    </Detail>
  </>
);
