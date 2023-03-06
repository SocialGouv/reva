import { useMachine } from "@xstate/react";
import { ReactNode, createContext, useContext } from "react";
import { InterpreterFrom, StateFrom } from "xstate";

import { mainMachine } from "../../machines/main.machine";
import { useConfiguredMainMachine } from "./configuredMainMachineHook";

interface MainMachineContextType {
  state: StateFrom<typeof mainMachine>;
  mainService: InterpreterFrom<typeof mainMachine>;
}

const MainMachineContext = createContext<MainMachineContextType>(
  {} as MainMachineContextType
);

export const MainMachineContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { configuredMainMachine } = useConfiguredMainMachine();
  const [state, , mainService] = useMachine(configuredMainMachine, {
    devTools: true,
  });

  return (
    <MainMachineContext.Provider value={{ state, mainService }}>
      {children}
    </MainMachineContext.Provider>
  );
};

export const useMainMachineContext = () => useContext(MainMachineContext);
