"use client";

import { Breadcrumb, BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";

import { useAuth } from "../auth/auth";

export const RoleDependentBreadcrumb = (props: BreadcrumbProps) => {
  const { isAdmin } = useAuth();

  const segments: BreadcrumbProps["segments"] = isAdmin
    ? [
        {
          label: "Commanditaires",
          linkProps: {
            href: "/commanditaires",
          },
        },
        ...props.segments,
      ]
    : props.segments;

  //do not render if there is no segments to display for the user role
  return segments.length ? <Breadcrumb {...props} segments={segments} /> : null;
};
