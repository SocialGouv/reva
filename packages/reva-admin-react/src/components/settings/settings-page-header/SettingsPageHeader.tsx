import { ReactNode } from "react";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

export const SettingsPageHeader = ({
  breadcrumb,
  title,
  titleTestId,
  showOptionalFieldsDisclaimer = false,
  chapo,
}: {
  breadcrumb?: ReactNode;
  title: string;
  titleTestId?: string;
  showOptionalFieldsDisclaimer?: boolean;
  chapo?: ReactNode;
}) => (
  <header>
    {breadcrumb}
    <h1 data-testid={titleTestId}>{title}</h1>
    {showOptionalFieldsDisclaimer && <FormOptionalFieldsDisclaimer />}
    {chapo && <p className="fr-text--lead mt-6 mb-12">{chapo}</p>}
  </header>
);
