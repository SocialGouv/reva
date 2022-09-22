import { FC } from "react";

import { Description } from "../../atoms/Description";

interface Props {
  term: string;
  details?: string[];
}

export const DescriptionMultiLine: FC<Props> = ({ term, details }) =>
  !!details && details.length > 0 ? (
    <Description term={term}>
      <ul>
        {details?.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </Description>
  ) : (
    <></>
  );
