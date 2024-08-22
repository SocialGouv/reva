import { GrayCard } from "@/components/card/gray-card/GrayCard";
import Button from "@codegouvfr/react-dsfr/Button";
import { ReactNode } from "react";

type HasButton =
  | {
      hasButton: true;
      buttonTitle: string;
      buttonOnClick: () => void;
      buttonPriority: "primary" | "secondary";
    }
  | {
      hasButton?: false;
      buttonTitle?: never;
      buttonOnClick?: never;
      buttonPriority?: never;
    };

interface CandidacySectionCardProps {
  children?: ReactNode;
  title: string;
  titleIconClass?: string;
  badge?: ReactNode;
  disabled?: boolean;
  "data-test"?: string;
}

const CandidacySectionCard = ({
  children,
  title,
  titleIconClass,
  hasButton,
  buttonOnClick,
  buttonTitle,
  buttonPriority,
  badge,
  disabled = false,
  "data-test": dataTest,
}: CandidacySectionCardProps & HasButton) => {
  return (
    <GrayCard data-test={dataTest}>
      <div className="flex justify-between items-center w-full mb-5">
        <div className="flex items-center gap-4 w-full">
          <h4
            className={`mb-0 sm:whitespace-nowrap ${disabled ? "text-neutral-400" : ""}`}
          >
            {titleIconClass && (
              <span className={`fr-icon fr-icon--lg ${titleIconClass} mr-2`} />
            )}
            {title}
          </h4>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 sm:w-full">
            <div>{!disabled && badge}</div>
            {hasButton && (
              <Button
                onClick={buttonOnClick}
                priority={buttonPriority}
                disabled={disabled}
              >
                {buttonTitle}
              </Button>
            )}
          </div>
        </div>
      </div>
      {children}
    </GrayCard>
  );
};

export default CandidacySectionCard;
