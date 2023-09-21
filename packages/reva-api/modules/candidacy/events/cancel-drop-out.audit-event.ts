import {
  AuditEvent,
  findAuditEventContent,
  findFirstAuditEventContent,
  saveAuditEvent,
} from "../../shared/audit";
import { CandidacyDropOut } from "../candidacy.types";
import { AuditEventType } from "./audit-event.type";

export async function cancelDropOutCandidacyEvent(
  accountId: string,
  data: CandidacyDropOut
) {
  const event = new AuditEvent({
    type: AuditEventType.CANCEL_CANDIDACY_DROP_OUT,
    accountId,
    content: data,
  });

  await saveAuditEvent(event);
}

// This is a sample on how to search AuditEvent in db
export async function findFirstCandidacyDropout(
  candidacyId: string
): Promise<CandidacyDropOut | null> {
  const candidacyDropOut = await findFirstAuditEventContent<CandidacyDropOut>({
    where: {
      type: AuditEventType.CANCEL_CANDIDACY_DROP_OUT,
      content: {
        path: ["candidacyId"],
        equals: candidacyId,
      },
    },
  });

  return candidacyDropOut;
}

// This is a sample on how to search AuditEvent in db
export async function findCandidacyDropout(
  candidacyId: string
): Promise<CandidacyDropOut[] | null> {
  const candidacyDropOut = await findAuditEventContent<CandidacyDropOut[]>({
    where: {
      type: AuditEventType.CANCEL_CANDIDACY_DROP_OUT,
      content: {
        path: ["candidacyId"],
        equals: candidacyId,
      },
    },
  });

  return candidacyDropOut;
}
