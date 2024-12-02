import { useState } from "react";

export const NoticeAlert = ({
  children,
  isClosable = true,
}: {
  children: React.ReactNode;
  isClosable?: boolean;
}) => {
  const [visible, setVisible] = useState(true);

  return visible ? (
    <div
      id="fr-notice-:r5:"
      className="fr-notice text-dsfr-light-decisions-text-default-warning bg-dsfr-light-decisions-background-contrast-warning -mb-8"
    >
      <div className="fr-container flex">
        <span className="fr-icon fr-icon-warning-fill -mt-[1px]" />
        <div className="fr-notice__body pl-4 flex-1">
          <div className="fr-notice__title">{children}</div>
          {isClosable && (
            <button
              className="fr-btn--close fr-btn text-dsfr-light-decisions-text-default-warning hover:bg-transparent"
              onClick={() => setVisible(false)}
            >
              Masquer le message
            </button>
          )}
        </div>
      </div>
    </div>
  ) : null;
};
