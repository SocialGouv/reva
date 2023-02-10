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
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
  accountPhoneNumber: string;
}
interface ProfessionalWorkspaceCreationState {
  currentStep: "stepOne" | "stepTwo" | "stepThree";
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

type StepTwoData = Pick<
  ProfessionalWorkspaceInfos,
  "accountFirstname" | "accountLastname" | "accountEmail" | "accountPhoneNumber"
>;

type ProfessionalWorkspaceCreationContext =
  ProfessionalWorkspaceCreationState & {
    submitStepOne: (stepData: StepOneData) => void;
    submitStepTwo: (stepData: StepTwoData) => void;
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
    (stepData: StepOneData) => {
      setState({
        currentStep: "stepTwo",
        professionalWorkspaceInfos: {
          ...state.professionalWorkspaceInfos,
          ...stepData,
        },
      });
    },
    [state]
  );

  const submitStepTwo = useCallback(
    (stepData: StepTwoData) => {
      setState({
        currentStep: "stepThree",
        professionalWorkspaceInfos: {
          ...state.professionalWorkspaceInfos,
          ...stepData,
        },
      });
    },
    [state]
  );

  return (
    <ProfessionalWorkspaceCreationContext.Provider
      value={{ ...state, submitStepOne, submitStepTwo }}
    >
      {props.children}
    </ProfessionalWorkspaceCreationContext.Provider>
  );
};

export const useProfessionalWorkspaceCreationContext = () =>
  useContext(ProfessionalWorkspaceCreationContext);
