import { ReactNode } from "react";

import { useMainMachineContext } from "../../../contexts/MainMachineContext/MainMachineContext";

export const BasicNameBadge = ({
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
      className={`text-3xl text-dsfrBlue-500 font-bold ${className}`}
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
}: {
  as: React.ElementType;
  className?: string;
  "data-test"?: string;
}) => {
  const { state } = useMainMachineContext();
  return (
    <BasicNameBadge as={as} className={className} data-test={dataTest}>
      {state.context.contact?.firstname} {state.context.contact?.lastname}
    </BasicNameBadge>
  );
};
