import { ReactNode } from "react";

const BasicNameBadge = ({
  className,
  "data-test": dataTest,
  children,
  as = "p",
}: {
  className?: string;
  "data-test"?: string;
  children?: ReactNode;
  as: React.ElementType;
}) => {
  const As = as;
  return (
    <As
      className={`text-3xl text-dsfrGray-800 font-bold ${className}`}
      data-test={dataTest}
    >
      {children}
    </As>
  );
};

export const NameBadge = ({
  as,
  className,
  "data-test": dataTest,
  firstname,
  lastname,
}: {
  as: React.ElementType;
  className?: string;
  "data-test"?: string;
  firstname?: string;
  lastname?: string;
}) => {
  return (
    <BasicNameBadge as={as} className={className} data-test={dataTest}>
      {firstname} {lastname}
    </BasicNameBadge>
  );
};
