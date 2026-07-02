import { ReactNode } from "react";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

export const SettingsPageHeader = ({
  breadcrumb,
  title,
  titleTestId,
  actions,
  showOptionalFieldsDisclaimer = false,
  chapo,
}: {
  breadcrumb?: ReactNode;
  title: string;
  titleTestId?: string;
  actions?: ReactNode;
  showOptionalFieldsDisclaimer?: boolean;
  chapo?: ReactNode;
}) => {
  const titleElement = (
    <h1
      data-testid={titleTestId}
      className={actions ? "flex-1 min-w-0 break-words" : undefined}
    >
      {title}
    </h1>
  );

  return (
    <header className="w-full min-w-0">
      {breadcrumb}
      {actions ? (
        <div className="flex flex-col gap-4 md:flex-row md:justify-between w-full min-w-0">
          {titleElement}
          <div className="flex flex-row flex-wrap justify-end items-start gap-4 w-full md:w-auto">
            {actions}
          </div>
        </div>
      ) : (
        titleElement
      )}
      {showOptionalFieldsDisclaimer && <FormOptionalFieldsDisclaimer />}
      {chapo && <p className="fr-text--lead mt-6 mb-12">{chapo}</p>}
    </header>
  );
};
