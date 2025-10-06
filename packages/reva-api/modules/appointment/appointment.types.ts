import { AppointmentDuration, AppointmentType } from "@prisma/client";

export interface CreateAppointmentInput {
  candidacyId: string;
  type: AppointmentType;
  title: string;
  description: string;
  date: Date;
  time: Date;
  location: string;
  duration: AppointmentDuration;
  sendEmailToCandidate?: boolean;
}

export interface UpdateAppointmentInput extends CreateAppointmentInput {
  appointmentId: string;
  candidacyId: string;
  title: string;
  description: string;
  date: Date;
  time: Date;
  location: string;
  duration: AppointmentDuration;
}
