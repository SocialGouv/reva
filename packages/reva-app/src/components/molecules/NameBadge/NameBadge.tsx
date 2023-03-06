import { ReactNode } from "react";

import { useMainMachineContext } from "../../../contexts/MainMachineContext/MainMachineContext";

export const BasicNameBadge = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <h2 className={`text-3xl text-dsfrBlue-500 font-bold ${className}`}>
    {children}
  </h2>
);

export const NameBadge = ({ className }: { className?: string }) => {
  const { state } = useMainMachineContext();
  return (
    <BasicNameBadge className={className}>
      {state.context.contact?.firstname} {state.context.contact?.lastname}
    </BasicNameBadge>
  );
};
