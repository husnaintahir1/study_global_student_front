import { api } from './api';

// Calendar Event Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  location?: string;
  isVirtual: boolean;
  meetingLink?: string;
  status: EventStatus;
  priority: EventPriority;
  createdBy: string;
  participants: string[];
  applicationId?: string;
  leadId?: string;
  reminderSent: boolean;
  reminderTime: number;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

export type EventType =
  | 'appointment'
  | 'deadline'
  | 'test_date'
  | 'interview'
  | 'orientation'
  | 'meeting'
  | 'submission'
  | 'payment'
  | 'reminder'
  | 'other';

export type EventStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

export type EventPriority = 'low' | 'medium' | 'high';

// API Request/Response Types
export interface EventRequest {
  title: string;
  description?: string;
  eventType: EventType;
  startDate: string;
  endDate?: string;
  isAllDay?: boolean;
  location?: string;
  priority?: EventPriority;
  reminderTime?: number;
}

export interface EventsResponse {
  message: string;
  events: CalendarEvent[];
}

export interface CreateEventResponse {
  message: string;
  event: CalendarEvent;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  eventType?: EventType;
  startDate?: string;
  endDate?: string;
  isAllDay?: boolean;
  location?: string;
  priority?: EventPriority;
  status?: EventStatus;
  reminderTime?: number;
}

export interface UpdateEventResponse {
  message: string;
  event: CalendarEvent;
}

// Event Type Configuration
export interface EventTypeConfig {
  label: string;
  color: string;
}

export const eventTypeConfigs: Record<EventType, EventTypeConfig> = {
  appointment: { label: 'Appointment', color: 'blue' },
  deadline: { label: 'Deadline', color: 'red' },
  test_date: { label: 'Test Date', color: 'purple' },
  interview: { label: 'Interview', color: 'green' },
  orientation: { label: 'Orientation', color: 'indigo' },
  meeting: { label: 'Meeting', color: 'gray' },
  submission: { label: 'Submission', color: 'orange' },
  payment: { label: 'Payment', color: 'yellow' },
  reminder: { label: 'Reminder', color: 'pink' },
  other: { label: 'Other', color: 'slate' },
};

export const priorityColors = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-red-100 text-red-800 border-red-200',
};

export const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  rescheduled: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

// Calendar Service Class
class CalendarService {
  /**
   * Get student events with optional month/year filtering
   */
  async getStudentEvents(
    month?: number,
    year?: number
  ): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/calendar/student/events?${queryString}`
      : '/calendar/student/events';

    const response = await api.get<EventsResponse>(url);
    return response.events;
  }

  /**
   * Create a new personal event
   */
  async createEvent(eventData: EventRequest): Promise<CalendarEvent> {
    const response = await api.post<CreateEventResponse>(
      '/calendar/student/create',
      eventData
    );
    return response.event;
  }

  /**
   * Get events created by or assigned to the current student
   * @param startDate - Start date for filtering (ISO string)
   * @param endDate - End date for filtering (ISO string)
   */
  async getMyEvents(
    startDate?: string,
    endDate?: string
  ): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const url = queryString
      ? `/calendar/my-events?${queryString}`
      : '/calendar/my-events';

    const response = await api.get<EventsResponse>(url);
    return response.events;
  }

  /**
   * Update an existing event (only events created by the student)
   */
  async updateEvent(
    eventId: string,
    updateData: UpdateEventRequest
  ): Promise<CalendarEvent> {
    const response = await api.put<UpdateEventResponse>(
      `/calendar/events/${eventId}`,
      updateData
    );
    return response.event;
  }

  /**
   * Delete an event (only events created by the student)
   */
  async deleteEvent(eventId: string): Promise<{ message: string }> {
    return api.delete(`/calendar/events/${eventId}`);
  }

  /**
   * Get events for a specific date range
   */
  async getEventsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<CalendarEvent[]> {
    // TODO: Implement when API is available
    const response = await api.get<EventsResponse>(
      `/calendar/student/events?startDate=${startDate}&endDate=${endDate}`
    );
    return response.events;
  }

  /**
   * Get today's events
   */
  async getTodayEvents(): Promise<CalendarEvent[]> {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const events = await this.getStudentEvents(month, year);
    const todayStr = today.toDateString();

    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === todayStr;
    });
  }

  /**
   * Get upcoming events (next 7 days)
   */
  async getUpcomingEvents(): Promise<CalendarEvent[]> {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const events = await this.getStudentEvents(month, year);

    return events
      .filter((event) => {
        const eventDate = new Date(event.startDate);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
  }

  /**
   * Get events by priority
   */
  async getEventsByPriority(priority: EventPriority): Promise<CalendarEvent[]> {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const events = await this.getStudentEvents(month, year);
    return events.filter((event) => event.priority === priority);
  }

  /**
   * Get events by type
   */
  async getEventsByType(eventType: EventType): Promise<CalendarEvent[]> {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const events = await this.getStudentEvents(month, year);
    return events.filter((event) => event.eventType === eventType);
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcomingDeadlines(limit: number = 5): Promise<CalendarEvent[]> {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const events = await this.getStudentEvents(month, year);

    return events
      .filter(
        (event) =>
          event.eventType === 'deadline' &&
          new Date(event.startDate) >= today &&
          event.status === 'scheduled'
      )
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
      .slice(0, limit);
  }
}

// Utility functions for event permissions
export const canEditEvent = (
  event: CalendarEvent,
  currentUserId: string
): boolean => {
  return event.createdBy === currentUserId;
};

export const canDeleteEvent = (
  event: CalendarEvent,
  currentUserId: string
): boolean => {
  return event.createdBy === currentUserId;
};

// Utility functions
export const getEventColor = (eventType: EventType): string => {
  return eventTypeConfigs[eventType]?.color || 'gray';
};

export const formatEventTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatEventDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const isEventToday = (event: CalendarEvent): boolean => {
  const today = new Date().toDateString();
  const eventDate = new Date(event.startDate).toDateString();
  return eventDate === today;
};

export const isEventUpcoming = (event: CalendarEvent): boolean => {
  const now = new Date();
  const eventDate = new Date(event.startDate);
  return eventDate > now;
};

export const getDaysUntilEvent = (event: CalendarEvent): number => {
  const now = new Date();
  const eventDate = new Date(event.startDate);
  const diffTime = eventDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Export the service instance
export const calendarService = new CalendarService();
