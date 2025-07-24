import {
  DsfrHeadBase,
  type DsfrHeadProps,
  createGetHtmlAttributes,
} from "@codegouvfr/react-dsfr/next-app-router/server-only-index";
import Link from "next/link";

import { defaultColorScheme } from "./defaultColorScheme";

// eslint-disable-next-line import/no-unused-modules
export const { getHtmlAttributes } = createGetHtmlAttributes({
  defaultColorScheme,
});

// eslint-disable-next-line import/no-unused-modules
export function DsfrHead(props: DsfrHeadProps) {
  return <DsfrHeadBase Link={Link} {...props} />;
}
