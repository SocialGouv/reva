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
  companyBic: string;
  companyIban: string;
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

type StepThreeData = Pick<
  ProfessionalWorkspaceInfos,
  "companyBic" | "companyIban"
>;

type ProfessionalWorkspaceCreationContext =
  ProfessionalWorkspaceCreationState & {
    goBackToPreviousStep: () => void;
    submitStepOne: (stepData: StepOneData) => void;
    submitStepTwo: (stepData: StepTwoData) => void;
    submitStepThree: (stepData: StepThreeData) => void;
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

  const goBackToPreviousStep = useCallback(() => {
    let newCurrentStep = state.currentStep;

    switch (state.currentStep) {
      case "stepTwo":
        newCurrentStep = "stepOne";
        break;
      case "stepThree":
        newCurrentStep = "stepTwo";
        break;
    }
    setState({ ...state, currentStep: newCurrentStep });
  }, [state]);

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

  const submitStepThree = useCallback(
    (stepData: StepThreeData) => {
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
      value={{
        ...state,
        goBackToPreviousStep,
        submitStepOne,
        submitStepTwo,
        submitStepThree,
      }}
    >
      {props.children}
    </ProfessionalWorkspaceCreationContext.Provider>
  );
};

export const useProfessionalWorkspaceCreationContext = () =>
  useContext(ProfessionalWorkspaceCreationContext);
