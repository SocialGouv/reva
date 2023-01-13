import { useMutation } from "@tanstack/react-query";
import { createContext, ReactNode, useContext, useState } from "react";
import { JobAndCompetencies, Certification } from "../../types/types";

interface UserInfos {
  revaIdentifier: string;
  jobsAndCompetencies: JobAndCompetencies[];
  diagnosis: Certification[];
}

interface MainContext {
  userInfos: UserInfos;
  updateUserInfos: (newUserInfos: UserInfos) => void;
  computeDiagnosis: () => void;
}

const MainContext = createContext<MainContext>({} as MainContext);

export const MainContextProvider = (props: { children?: ReactNode }) => {
  const [userInfos, setUserInfos] = useState<UserInfos>({
    revaIdentifier: "",
    jobsAndCompetencies: [],
    diagnosis: [],
  });

  const computeDiagnosisMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        body: JSON.stringify(
          userInfos.jobsAndCompetencies.flatMap((jAndC) => jAndC.competencies)
        ),
      });

      return res.ok ? ((await res.json()) as Certification[]) : [];
    },
  });

  const updateUserInfos = (newUserInfos: UserInfos) =>
    setUserInfos(newUserInfos);

  const computeDiagnosis = async () => {
    const diagnosis = await computeDiagnosisMutation.mutateAsync();
    setUserInfos({
      ...userInfos,
      diagnosis,
    });
  };

  return (
    <MainContext.Provider
      value={{
        userInfos,
        updateUserInfos,
        computeDiagnosis,
      }}
    >
      {props.children}
    </MainContext.Provider>
  );
};

export const useMainImportContext = (): MainContext => useContext(MainContext);
