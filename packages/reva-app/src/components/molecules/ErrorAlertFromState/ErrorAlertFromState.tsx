import { ErrorAlert } from "components/atoms/ErrorAlert/ErrorAlert";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";

export const ErrorAlertFromState = () => {
  const { state } = useMainMachineContext();

  return state.context.error ? (
    <ErrorAlert message={state.context.error} />
  ) : null;
};
