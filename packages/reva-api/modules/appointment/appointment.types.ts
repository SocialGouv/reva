import { AppointmentType } from "@prisma/client";

export interface CreateAppointmentInput {
  candidacyId: string;
  type: AppointmentType;
  title: string;
  description: string;
  date: Date;
  location: string;
}

export interface UpdateAppointmentInput extends CreateAppointmentInput {
  appointmentId: string;
}
