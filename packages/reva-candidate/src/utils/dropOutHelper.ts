import { addMonths, isAfter } from "date-fns";

const isDropOutGracePeriodOver = ({ dropOutDate }: { dropOutDate: Date }) =>
  isAfter(new Date(), addMonths(dropOutDate, 4));

export const isDropOutConfirmed = ({
  dropOutConfirmedByCandidate,
  proofReceivedByAdmin,
  dropOutDate,
}: {
  dropOutConfirmedByCandidate: boolean;
  proofReceivedByAdmin: boolean;
  dropOutDate: Date;
}) =>
  dropOutConfirmedByCandidate ||
  proofReceivedByAdmin ||
  isDropOutGracePeriodOver({ dropOutDate });
