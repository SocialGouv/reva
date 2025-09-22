import { AuditEvent } from "@/modules/shared/audit/audit-event.entity";
import { saveAuditEvent } from "@/modules/shared/audit/audit-event.repository";

import { CandidacyDropOut } from "../candidacy.types";

import { AuditEventType } from "./audit-event.type";

export async function cancelDropOutCandidacyEvent(
  accountId: string,
  data: CandidacyDropOut,
) {
  const event = new AuditEvent({
    type: AuditEventType.CANCEL_CANDIDACY_DROP_OUT,
    accountId,
    content: data,
  });

  await saveAuditEvent(event);
}
