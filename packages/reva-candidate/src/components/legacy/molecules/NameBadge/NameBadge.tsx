import { ReactNode } from "react";

const BasicNameBadge = ({
  className,
  "data-testid": dataTest,
  children,
  as = "p",
}: {
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
  as: React.ElementType;
}) => {
  const As = as;
  return (
    <As
      className={`text-3xl text-dsfrGray-800 font-bold ${className}`}
      data-testid={dataTest}
    >
      {children}
    </As>
  );
};

export const NameBadge = ({
  as,
  className,
  "data-testid": dataTest,
  firstname,
  lastname,
}: {
  as: React.ElementType;
  className?: string;
  "data-testid"?: string;
  firstname?: string;
  lastname?: string;
}) => {
  return (
    <BasicNameBadge as={as} className={className} data-testid={dataTest}>
      {firstname} {lastname}
    </BasicNameBadge>
  );
};
