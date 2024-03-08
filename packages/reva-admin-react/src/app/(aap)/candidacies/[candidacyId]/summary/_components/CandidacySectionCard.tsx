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
  children: ReactNode;
  title: string;
  Badge: () => ReactNode;
}

const CandidacySectionCard = ({
  children,
  title,
  hasButton,
  buttonOnClick,
  buttonTitle,
  buttonPriority,
  Badge,
}: CandidacySectionCardProps & HasButton) => {
  return (
    <div className="flex w-full flex-col p-6 bg-light-grey">
      <div className="flex justify-between w-full mb-6">
        <div className="flex gap-4">
          <h4 className="text-2xl font-bold">{title}</h4>
          {Badge && <Badge />}
        </div>
        {hasButton && (
          <Button onClick={buttonOnClick} priority={buttonPriority}>
            {buttonTitle}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
};

export default CandidacySectionCard;
