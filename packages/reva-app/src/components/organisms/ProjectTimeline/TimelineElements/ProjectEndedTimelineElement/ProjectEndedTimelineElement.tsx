import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";

export const ProjectEndedTimelineElement = () => {
  const { state } = useMainMachineContext();

  const { jury } = state.context;

  const success = jury?.result?.indexOf("SUCCESS") !== -1;
  const showTrophy = jury?.result?.indexOf("FULL_SUCCESS") !== -1;

  return success ? (
    <div className="mt-8 flex flex-row gap-6 p-4 max-w-[600px] shadow-[0_6px_18px_0_rgba(0,0,18,0.16)]">
      {showTrophy && (
        <img width="56" height="56" src="/app/img/trophy.png" alt="Trophée" />
      )}
      <label className="text-xl font-bold">
        Félicitations, vous avez obtenu votre diplôme par la Validation des
        Acquis de l'Expérience (VAE) !
      </label>
    </div>
  ) : null;
};
