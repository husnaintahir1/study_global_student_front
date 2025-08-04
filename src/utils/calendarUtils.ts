import {
  CalendarEvent,
  EventType,
  EventPriority,
  EventStatus,
} from './calendarService';

// Calendar day interface
export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  events: CalendarEvent[];
}

// Date range interface
export interface DateRange {
  start: Date;
  end: Date;
}

// Event filters interface
export interface EventFilters {
  eventType?: EventType;
  priority?: EventPriority;
  status?: EventStatus;
  dateRange?: DateRange;
  searchTerm?: string;
}

// Grouped events interface
export interface GroupedEvents {
  date: string;
  events: CalendarEvent[];
}

// Calendar navigation utilities
export const calendarUtils = {
  /**
   * Get calendar grid for a specific month
   */
  getCalendarDays(year: number, month: number): CalendarDay[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startCalendar = new Date(firstDay);
    const endCalendar = new Date(lastDay);

    // Start from the Sunday before the first day of the month
    startCalendar.setDate(startCalendar.getDate() - startCalendar.getDay());

    // End on the Saturday after the last day of the month
    endCalendar.setDate(endCalendar.getDate() + (6 - endCalendar.getDay()));

    const days: CalendarDay[] = [];
    const currentDate = new Date(startCalendar);
    const today = new Date();

    while (currentDate <= endCalendar) {
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = calendarUtils.isSameDay(currentDate, today);
      const isPast = currentDate < today && !isToday;

      days.push({
        date: new Date(currentDate),
        dayNumber: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isPast,
        events: [], // Will be populated later
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  },

  /**
   * Distribute events into calendar days
   */
  distributeEventsToCalendarDays(
    calendarDays: CalendarDay[],
    events: CalendarEvent[]
  ): CalendarDay[] {
    return calendarDays.map((day) => ({
      ...day,
      events: events.filter((event) =>
        calendarUtils.isSameDay(new Date(event.startDate), day.date)
      ),
    }));
  },

  /**
   * Check if two dates are the same day
   */
  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  },

  /**
   * Check if date is today
   */
  isToday(date: Date): boolean {
    return calendarUtils.isSameDay(date, new Date());
  },

  /**
   * Check if date is in the past
   */
  isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  },

  /**
   * Check if date is in the future
   */
  isFuture(date: Date): boolean {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date > today;
  },

  /**
   * Get days between two dates
   */
  getDaysBetween(startDate: Date, endDate: Date): number {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  },

  /**
   * Get start and end of month
   */
  getMonthRange(year: number, month: number): DateRange {
    return {
      start: new Date(year, month, 1),
      end: new Date(year, month + 1, 0),
    };
  },

  /**
   * Get start and end of week
   */
  getWeekRange(date: Date): DateRange {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  },

  /**
   * Get start and end of day
   */
  getDayRange(date: Date): DateRange {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  },

  /**
   * Navigate to next month
   */
  getNextMonth(currentDate: Date): Date {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(currentDate.getMonth() + 1);
    return nextMonth;
  },

  /**
   * Navigate to previous month
   */
  getPreviousMonth(currentDate: Date): Date {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(currentDate.getMonth() - 1);
    return prevMonth;
  },
};

// Date formatting utilities
export const dateFormatter = {
  /**
   * Format date as 'January 2025'
   */
  formatMonthYear(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  },

  /**
   * Format date as 'Monday, January 15, 2025'
   */
  formatFullDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * Format date as 'Jan 15, 2025'
   */
  formatShortDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  /**
   * Format date as 'Jan 15'
   */
  formatMonthDay(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  },

  /**
   * Format time as '2:30 PM'
   */
  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  },

  /**
   * Format date and time as 'Jan 15, 2:30 PM'
   */
  formatDateTime(date: Date): string {
    return `${dateFormatter.formatMonthDay(date)}, ${dateFormatter.formatTime(
      date
    )}`;
  },

  /**
   * Format relative time (e.g., '2 hours ago', 'In 3 days')
   */
  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (Math.abs(diffMinutes) < 60) {
      if (diffMinutes === 0) return 'Now';
      return diffMinutes > 0
        ? `In ${diffMinutes} minutes`
        : `${Math.abs(diffMinutes)} minutes ago`;
    }

    if (Math.abs(diffHours) < 24) {
      return diffHours > 0
        ? `In ${diffHours} hours`
        : `${Math.abs(diffHours)} hours ago`;
    }

    if (Math.abs(diffDays) < 7) {
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays === -1) return 'Yesterday';
      return diffDays > 0
        ? `In ${diffDays} days`
        : `${Math.abs(diffDays)} days ago`;
    }

    return dateFormatter.formatShortDate(date);
  },

  /**
   * Format duration between two dates
   */
  formatDuration(startDate: Date, endDate: Date): string {
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;

    if (diffHours === 0) {
      return `${diffMinutes} min`;
    }

    if (remainingMinutes === 0) {
      return `${diffHours} hr`;
    }

    return `${diffHours}h ${remainingMinutes}m`;
  },

  /**
   * Get days until deadline
   */
  getDaysUntilDeadline(date: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(date);
    deadline.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `${diffDays} days left`;
    return `${Math.abs(diffDays)} days overdue`;
  },

  /**
   * Convert local datetime string to ISO string
   */
  localDateTimeToISO(localDateTime: string): string {
    return new Date(localDateTime).toISOString();
  },

  /**
   * Convert ISO string to local datetime string
   */
  isoToLocalDateTime(isoString: string): string {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  },
};

// Event filtering and sorting utilities
export const eventUtils = {
  /**
   * Filter events based on criteria
   */
  filterEvents(
    events: CalendarEvent[],
    filters: EventFilters
  ): CalendarEvent[] {
    return events.filter((event) => {
      // Filter by event type
      if (filters.eventType && event.eventType !== filters.eventType) {
        return false;
      }

      // Filter by priority
      if (filters.priority && event.priority !== filters.priority) {
        return false;
      }

      // Filter by status
      if (filters.status && event.status !== filters.status) {
        return false;
      }

      // Filter by date range
      if (filters.dateRange) {
        const eventDate = new Date(event.startDate);
        if (
          eventDate < filters.dateRange.start ||
          eventDate > filters.dateRange.end
        ) {
          return false;
        }
      }

      // Filter by search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(searchLower);
        const matchesDescription = event.description
          ?.toLowerCase()
          .includes(searchLower);
        const matchesLocation = event.location
          ?.toLowerCase()
          .includes(searchLower);

        if (!matchesTitle && !matchesDescription && !matchesLocation) {
          return false;
        }
      }

      return true;
    });
  },

  /**
   * Sort events by date
   */
  sortEventsByDate(
    events: CalendarEvent[],
    ascending: boolean = true
  ): CalendarEvent[] {
    return [...events].sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  },

  /**
   * Sort events by priority
   */
  sortEventsByPriority(events: CalendarEvent[]): CalendarEvent[] {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return [...events].sort((a, b) => {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  },

  /**
   * Group events by date
   */
  groupEventsByDate(events: CalendarEvent[]): GroupedEvents[] {
    const grouped = events.reduce((acc, event) => {
      const dateKey = dateFormatter.formatShortDate(new Date(event.startDate));

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }

      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);

    return Object.entries(grouped)
      .map(([date, events]) => ({ date, events }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  /**
   * Get today's events
   */
  getTodayEvents(events: CalendarEvent[]): CalendarEvent[] {
    const today = new Date();
    return events.filter((event) =>
      calendarUtils.isSameDay(new Date(event.startDate), today)
    );
  },

  /**
   * Get upcoming events (next 7 days)
   */
  getUpcomingEvents(
    events: CalendarEvent[],
    days: number = 7
  ): CalendarEvent[] {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return eventDate >= now && eventDate <= futureDate;
    });
  },

  /**
   * Get overdue events
   */
  getOverdueEvents(events: CalendarEvent[]): CalendarEvent[] {
    const now = new Date();
    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate < now &&
        (event.eventType === 'deadline' || event.eventType === 'submission') &&
        event.status === 'scheduled'
      );
    });
  },

  /**
   * Get next upcoming event
   */
  getNextEvent(events: CalendarEvent[]): CalendarEvent | null {
    const now = new Date();
    const futureEvents = events
      .filter((event) => new Date(event.startDate) > now)
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

    return futureEvents[0] || null;
  },

  /**
   * Check if event is happening now
   */
  isEventHappeningNow(event: CalendarEvent): boolean {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : startDate;

    return now >= startDate && now <= endDate;
  },

  /**
   * Check if event is starting soon (within 30 minutes)
   */
  isEventStartingSoon(event: CalendarEvent): boolean {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const timeDiff = startDate.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    return minutesDiff > 0 && minutesDiff <= 30;
  },
};

// Constants
export const CALENDAR_CONSTANTS = {
  DAYS_OF_WEEK: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  MONTHS: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  DEFAULT_REMINDER_OPTIONS: [
    { value: 0, label: 'At time of event' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 120, label: '2 hours before' },
    { value: 1440, label: '1 day before' },
    { value: 2880, label: '2 days before' },
    { value: 10080, label: '1 week before' },
  ],
};

// Error handling utility
export const parseCalendarError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
};
