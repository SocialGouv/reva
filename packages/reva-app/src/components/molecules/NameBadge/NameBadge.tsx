import { ReactNode } from "react";

import { useMainMachineContext } from "../../../contexts/MainMachineContext/MainMachineContext";

export const BasicNameBadge = ({
  className,
  children,
  as = "p",
}: {
  className?: string;
  children?: ReactNode;
  as: React.ElementType;
}) => {
  const As = as;
  return (
    <As className={`text-3xl text-dsfrBlue-500 font-bold ${className}`}>
      {children}
    </As>
  );
};

export const NameBadge = ({
  as,
  className,
}: {
  as: React.ElementType;
  className?: string;
}) => {
  const { state } = useMainMachineContext();
  return (
    <BasicNameBadge as={as} className={className}>
      {state.context.contact?.firstname} {state.context.contact?.lastname}
    </BasicNameBadge>
  );
};
