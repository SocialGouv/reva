import { Prisma } from "@prisma/client";

import { AuditEventDataInterface } from "./audit-event.type";

export interface AuditEventInterface<T extends AuditEventDataInterface> {
  accountId: string;
  type: string;
  content: T;
}

export class AuditEvent<T extends AuditEventDataInterface> {
  public readonly createdAt: Date;

  public readonly accountId: string;

  public readonly type: string;

  public readonly content: Prisma.InputJsonValue;

  constructor(data: AuditEventInterface<T>) {
    this.createdAt = new Date();
    this.accountId = data.accountId;
    this.type = data.type;
    this.content = data.content;
  }
}
