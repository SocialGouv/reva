import { prismaClient } from "@/prisma/client";

import { AuditEvent } from "./audit-event.entity";
import { AuditEventDataInterface } from "./audit-event.type";

export async function saveAuditEvent<T extends AuditEventDataInterface>(
  event: AuditEvent<T>,
) {
  try {
    await prismaClient.auditEvent.create({
      data: event,
    });
  } catch (error) {
    console.error(error);
  }
}
