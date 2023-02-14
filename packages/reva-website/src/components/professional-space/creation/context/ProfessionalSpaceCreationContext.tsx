import { useCallback, useContext, useState } from "react";
import { createContext, ReactNode } from "react";

type LegalStatus = "EI" | "EURL" | "SARL" | "SAS" | "SASU" | "SA";

interface ProfessionalSpaceInfos {
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
interface ProfessionalSpaceCreationState {
  currentStep: "stepOne" | "stepTwo" | "stepThree";
  professionalSpaceInfos: Partial<ProfessionalSpaceInfos>;
}

type StepOneData = Pick<
  ProfessionalSpaceInfos,
  | "companySiret"
  | "companyAddress"
  | "companyName"
  | "companyBillingAddress"
  | "companyBillingEmail"
  | "companyLegalStatus"
>;

type StepTwoData = Pick<
  ProfessionalSpaceInfos,
  "accountFirstname" | "accountLastname" | "accountEmail" | "accountPhoneNumber"
>;

type StepThreeData = Pick<ProfessionalSpaceInfos, "companyBic" | "companyIban">;

type ProfessionalSpaceCreationContext = ProfessionalSpaceCreationState & {
  goBackToPreviousStep: () => void;
  submitStepOne: (stepData: StepOneData) => void;
  submitStepTwo: (stepData: StepTwoData) => void;
  submitStepThree: (stepData: StepThreeData) => void;
};

const ProfessionalSpaceCreationContext =
  createContext<ProfessionalSpaceCreationContext>(
    {} as ProfessionalSpaceCreationContext
  );

export const ProfessionalSpaceCreationProvider = (props: {
  children?: ReactNode;
}) => {
  const [state, setState] = useState<ProfessionalSpaceCreationState>({
    currentStep: "stepOne",
    professionalSpaceInfos: {
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
        professionalSpaceInfos: {
          ...state.professionalSpaceInfos,
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
        professionalSpaceInfos: {
          ...state.professionalSpaceInfos,
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
        professionalSpaceInfos: {
          ...state.professionalSpaceInfos,
          ...stepData,
        },
      });
    },
    [state.professionalSpaceInfos]
  );

  return (
    <ProfessionalSpaceCreationContext.Provider
      value={{
        ...state,
        goBackToPreviousStep,
        submitStepOne,
        submitStepTwo,
        submitStepThree,
      }}
    >
      {props.children}
    </ProfessionalSpaceCreationContext.Provider>
  );
};

export const useProfessionalSpaceCreationContext = () =>
  useContext(ProfessionalSpaceCreationContext);
