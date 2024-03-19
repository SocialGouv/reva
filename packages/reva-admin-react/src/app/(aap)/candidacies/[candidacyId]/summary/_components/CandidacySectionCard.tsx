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
    <GrayCard>
      <div className="flex justify-between items-center w-full mb-5">
        <div className="flex items-center gap-4">
          <h4 className="text-2xl font-bold mb-0">{title}</h4>
          {Badge && <Badge />}
        </div>
        {hasButton && (
          <Button onClick={buttonOnClick} priority={buttonPriority}>
            {buttonTitle}
          </Button>
        )}
      </div>
      {children}
    </GrayCard>
  );
};

export default CandidacySectionCard;
