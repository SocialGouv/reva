import React, { useCallback, useContext, useState } from "react";
import { createContext, ReactNode } from "react";

type LegalStatus = "EI" | "EURL" | "SARL" | "SAS" | "SASU" | "SA";

interface ProfessionalWorkspaceInfos {
  companySiret: string;
  companyAddress: string;
  companyName: string;
  companyBillingAddress: string;
  companyBillingEmail: string;
  companyLegalStatus: LegalStatus;
}
interface ProfessionalWorkspaceCreationState {
  currentStep: "stepOne" | "stepTwo";
  professionalWorkspaceInfos: Partial<ProfessionalWorkspaceInfos>;
}

type StepOneData = Pick<
  ProfessionalWorkspaceInfos,
  | "companySiret"
  | "companyAddress"
  | "companyName"
  | "companyBillingAddress"
  | "companyBillingEmail"
  | "companyLegalStatus"
>;

type ProfessionalWorkspaceCreationContext =
  ProfessionalWorkspaceCreationState & {
    submitStepOne: (stepOneData: StepOneData) => void;
  };

const ProfessionalWorkspaceCreationContext =
  createContext<ProfessionalWorkspaceCreationContext>(
    {} as ProfessionalWorkspaceCreationContext
  );

export const ProfessionalWorkspaceCreationProvider = (props: {
  children?: ReactNode;
}) => {
  const [state, setState] = useState<ProfessionalWorkspaceCreationState>({
    currentStep: "stepOne",
    professionalWorkspaceInfos: {
      companyLegalStatus: "EI",
    },
  });

  const submitStepOne = useCallback(
    (stepOneData: StepOneData) => {
      setState({
        currentStep: "stepTwo",
        professionalWorkspaceInfos: {
          ...state.professionalWorkspaceInfos,
          ...stepOneData,
        },
      });
    },
    [state]
  );

  return (
    <ProfessionalWorkspaceCreationContext.Provider
      value={{ ...state, submitStepOne }}
    >
      {props.children}
    </ProfessionalWorkspaceCreationContext.Provider>
  );
};

export const useProfessionalWorkspaceCreationContext = () =>
  useContext(ProfessionalWorkspaceCreationContext);
