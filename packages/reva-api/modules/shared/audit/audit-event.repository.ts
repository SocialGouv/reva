import { Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { AuditEvent } from "./audit-event.entity";
import { AuditEventDataInterface } from "./audit-event.type";

export async function saveAuditEvent<T extends AuditEventDataInterface>(
  event: AuditEvent<T>
) {
  try {
    await prismaClient.auditEvent.create({
      data: event,
    });
  } catch (error) {
    console.error(error);
  }
}

export async function findFirstAuditEventContent<
  T extends AuditEventDataInterface
>(args: Prisma.AuditEventFindFirstArgs): Promise<T | null> {
  try {
    const event = await prismaClient.auditEvent.findFirst(args);
    if (!event) {
      throw new Error("AuditEvent not found");
    }

    return event.content as T;
  } catch (error) {
    console.error(error);
  }

  return null;
}

export async function findAuditEventContent<
  T extends AuditEventDataInterface[]
>(args: Prisma.AuditEventFindManyArgs): Promise<T | null> {
  try {
    const events = await prismaClient.auditEvent.findMany(args);

    return events.map((event) => event.content) as T;
  } catch (error) {
    console.error(error);
  }

  return null;
}
