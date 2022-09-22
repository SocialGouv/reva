import { FC } from "react";

import { Description } from "../../atoms/Description";

interface Props {
  term: string;
  detail?: string;
}

export const DescriptionSimple: FC<Props> = ({ term, detail }) => (
  <Description term={term}>{detail}</Description>
);
