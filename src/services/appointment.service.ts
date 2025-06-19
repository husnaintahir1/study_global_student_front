import { api } from './api';
import { Appointment } from '@/types';

export interface AvailableSlot {
  consultantId: string;
  consultantName: string;
  date: string;
  timeSlots: Array<{
    time: string;
    available: boolean;
  }>;
}

export interface AppointmentRequest {
  consultantId?: string;
  dateTime: string;
  type: 'in_person' | 'virtual';
  notes?: string;
}

class AppointmentService {
  async getAppointments(): Promise<Appointment[]> {
    return api.get<Appointment[]>('/student/appointments');
  }

  async getUpcomingAppointments(): Promise<Appointment[]> {
    return api.get<Appointment[]>('/student/appointments?status=scheduled');
  }

  async getAppointmentById(id: string): Promise<Appointment> {
    return api.get<Appointment>(`/student/appointments/${id}`);
  }

  async getAvailableSlots(date: string): Promise<AvailableSlot[]> {
    return api.get<AvailableSlot[]>(`/student/appointments/slots?date=${date}`);
  }

  async bookAppointment(data: AppointmentRequest): Promise<Appointment> {
    return api.post<Appointment>('/student/appointments', data);
  }

  async rescheduleAppointment(
    id: string,
    dateTime: string
  ): Promise<Appointment> {
    return api.put<Appointment>(`/student/appointments/${id}`, { dateTime });
  }

  async cancelAppointment(
    id: string,
    reason?: string
  ): Promise<{ message: string }> {
    return api.delete(`/student/appointments/${id}`, {
      data: { reason },
    });
  }

  async joinVirtualMeeting(
    appointmentId: string
  ): Promise<{ meetingUrl: string }> {
    return api.post(`/student/meetings/join`, { appointmentId });
  }

  async getConsultantAvailability(
    consultantId: string,
    month: string
  ): Promise<{
    consultantId: string;
    availability: Array<{
      date: string;
      available: boolean;
      slots: number;
    }>;
  }> {
    return api.get(
      `/student/appointments/consultant/${consultantId}/availability?month=${month}`
    );
  }
}

export const appointmentService = new AppointmentService();
