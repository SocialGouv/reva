import {
  DsfrHeadBase,
  type DsfrHeadProps,
  createGetHtmlAttributes,
} from "@codegouvfr/react-dsfr/next-app-router/server-only-index";
import { defaultColorScheme } from "./defaultColorScheme";
import Link from "next/link";

// eslint-disable-next-line import/no-unused-modules
export const { getHtmlAttributes } = createGetHtmlAttributes({
  defaultColorScheme,
});

// eslint-disable-next-line import/no-unused-modules
export function DsfrHead(props: DsfrHeadProps) {
  return <DsfrHeadBase Link={Link} {...props} />;
}
