import { CandidacyUseCandidateForDashboard } from "../dashboard.hooks";

import { AppointmentTiles } from "./appointments/AppointmentTiles";
import { ContactTiles } from "./contacts/ContactTiles";
import { NextActionTiles } from "./next-actions/NextActionTiles";

export const DashboardSidebar = ({
  candidacy,
  isNextActionsFeatureActive,
  className,
}: {
  candidacy: CandidacyUseCandidateForDashboard;
  isNextActionsFeatureActive: boolean;
  className?: string;
}) => {
  return (
    <div
      className={`flex flex-col gap-y-8 ${className || ""}`}
      data-test="dashboard-sidebar"
    >
      {isNextActionsFeatureActive && <NextActionTiles candidacy={candidacy} />}
      <AppointmentTiles candidacy={candidacy} />
      <ContactTiles candidacy={candidacy} />
    </div>
  );
};
