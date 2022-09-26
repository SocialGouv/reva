import { FC } from "react";

import { Description } from "../../atoms/Description";

interface Props {
  term: string;
  detail?: string | number;
  suffix?: string;
}

export const DescriptionSimple: FC<Props> = ({ term, detail, suffix = "" }) =>
  !!detail ? (
    <Description term={term}>{`${detail}${suffix}`}</Description>
  ) : (
    <></>
  );
