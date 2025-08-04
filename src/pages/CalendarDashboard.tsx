import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertCircle,
  X,
  Filter,
  Search
} from 'lucide-react';

// Import calendar service and types
import { 
  calendarService,
  CalendarEvent,
  EventRequest,
  UpdateEventRequest,
  EventType,
  EventPriority,
  eventTypeConfigs,
  priorityColors,
  getEventColor,
  formatEventTime,
  formatEventDate
} from '../services/calendarService';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

interface EventFormData {
  title: string;
  description: string;
  eventType: EventType | '';
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  location: string;
  priority: EventPriority;
  reminderTime: number;
}

const StudentCalendarDashboard: React.FC = () => {
  // State management with proper types
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [currentUser] = useState<{ id: string }>({ id: 'current-user-id' }); // This should come from auth context
  const [viewMode, setViewMode] = useState<'all' | 'my'>('all');

  // Form data for creating events with proper typing
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    eventType: '',
    startDate: '',
    endDate: '',
    isAllDay: false,
    location: '',
    priority: 'medium',
    reminderTime: 120
  });

  // Fetch events using the service
  const fetchEvents = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      let eventsData: CalendarEvent[];
      
      if (viewMode === 'my') {
        // Get my events with date filtering
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        eventsData = await calendarService.getMyEvents(
          startOfMonth.toISOString(),
          endOfMonth.toISOString()
        );
      } else {
        // Get all student events
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        eventsData = await calendarService.getStudentEvents(month, year);
      }
      
      setEvents(eventsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load events';
      setError(errorMessage);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new event using the service
  const createEvent = async (): Promise<void> => {
    if (!formData.title || !formData.eventType || !formData.startDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const eventRequest: EventRequest = {
        title: formData.title,
        description: formData.description || undefined,
        eventType: formData.eventType as EventType,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        isAllDay: formData.isAllDay,
        location: formData.location || undefined,
        priority: formData.priority,
        reminderTime: formData.reminderTime
      };

      const newEvent = await calendarService.createEvent(eventRequest);
      setEvents(prev => [...prev, newEvent]);
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update existing event
  const updateEvent = async (): Promise<void> => {
    if (!editingEvent || !formData.title || !formData.eventType || !formData.startDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const updateRequest: UpdateEventRequest = {
        title: formData.title,
        description: formData.description || undefined,
        eventType: formData.eventType as EventType,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        isAllDay: formData.isAllDay,
        location: formData.location || undefined,
        priority: formData.priority,
        reminderTime: formData.reminderTime
      };

      const updatedEvent = await calendarService.updateEvent(editingEvent.id, updateRequest);
      setEvents(prev => prev.map(event => event.id === updatedEvent.id ? updatedEvent : event));
      setShowEditForm(false);
      setEditingEvent(null);
      setSelectedEvent(null);
      resetForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete event
  const deleteEvent = async (eventId: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      await calendarService.deleteEvent(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setSelectedEvent(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete event';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Start editing an event
  const startEditingEvent = (event: CalendarEvent): void => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      eventType: event.eventType,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      isAllDay: event.isAllDay,
      location: event.location || '',
      priority: event.priority,
      reminderTime: event.reminderTime
    });
    setShowEditForm(true);
    setSelectedEvent(null);
  };

  // Check if user can edit/delete event
  const canEditEvent = (event: CalendarEvent): boolean => {
    return event.createdBy === currentUser.id;
  };

  const resetForm = (): void => {
    setFormData({
      title: '',
      description: '',
      eventType: '',
      startDate: '',
      endDate: '',
      isAllDay: false,
      location: '',
      priority: 'medium',
      reminderTime: 120
    });
    setError('');
  };

  // Calendar navigation
  const navigateMonth = (direction: number): void => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = (): void => {
    setCurrentDate(new Date());
  };

  // Get calendar days for current month
  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const currentDateObj = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.toDateString() === currentDateObj.toDateString();
      });

      days.push({
        date: new Date(currentDateObj),
        dayNumber: currentDateObj.getDate(),
        isCurrentMonth: currentDateObj.getMonth() === month,
        isToday: currentDateObj.toDateString() === new Date().toDateString(),
        events: dayEvents
      });

      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return days;
  };

  // Get today's events
  const getTodayEvents = (): CalendarEvent[] => {
    const today = new Date().toDateString();
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === today;
    });
  };

  // Handle form input changes
  const handleFormChange = (field: keyof EventFormData, value: string | boolean): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch events when currentDate or viewMode changes
  useEffect(() => {
    fetchEvents();
  }, [currentDate, viewMode]);

  const calendarDays = getCalendarDays();
  const todayEvents = getTodayEvents();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Background decorations */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Calendar</h1>
              <p className="text-gray-600 mt-1">Manage your schedule and upcoming events</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'all' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All Events
                </button>
                <button
                  onClick={() => setViewMode('my')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'my' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Events
                </button>
              </div>

              {/* Coming Soon Features */}
              <div className="relative group">
                <button className="px-4 py-2 border border-gray-300 text-gray-400 rounded-xl font-medium cursor-not-allowed">
                  <Search className="h-4 w-4 inline mr-2" />
                  Search
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Coming Soon
                </div>
              </div>

              <div className="relative group">
                <button className="px-4 py-2 border border-gray-300 text-gray-400 rounded-xl font-medium cursor-not-allowed">
                  <Filter className="h-4 w-4 inline mr-2" />
                  Filter
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Coming Soon
                </div>
              </div>

              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                New Event
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Calendar */}
            <div className="lg:col-span-3">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    
                    <button
                      onClick={goToToday}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Today
                    </button>
                    
                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Days of week header */}
                  {daysOfWeek.map(day => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {calendarDays.map((day, index) => (
                    <div 
                      key={index} 
                      className={`min-h-[100px] p-2 border border-gray-100 hover:bg-gray-50 transition-colors ${
                        !day.isCurrentMonth ? 'text-gray-400 bg-gray-50/50' : ''
                      } ${day.isToday ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        day.isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {day.dayNumber}
                      </div>
                      
                      {/* Events for this day */}
                      <div className="space-y-1">
                        {day.events.slice(0, 3).map(event => (
                          <div 
                            key={event.id}
                            className={`text-xs p-1 rounded cursor-pointer truncate bg-${getEventColor(event.eventType)}-100 text-${getEventColor(event.eventType)}-800 hover:bg-${getEventColor(event.eventType)}-200 transition-colors`}
                            onClick={() => setSelectedEvent(event)}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {day.events.length > 3 && (
                          <div className="text-xs text-gray-500 font-medium">
                            +{day.events.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {loading && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-2">Loading events...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Today's Events Widget */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Today's Events
                </h3>
                
                {todayEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No events scheduled for today</p>
                ) : (
                  <div className="space-y-3">
                    {todayEvents.map(event => (
                      <div 
                        key={event.id} 
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className={`w-3 h-3 rounded-full bg-${getEventColor(event.eventType)}-500`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{event.title}</p>
                          <p className="text-sm text-gray-600">{formatEventTime(event.startDate)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs border ${priorityColors[event.priority]}`}>
                          {event.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Deadlines - Coming Soon */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 relative">
                <div className="absolute inset-0 bg-gray-50/50 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">Upcoming Deadlines</p>
                    <p className="text-sm text-gray-400">Coming Soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Creation Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
              <button
                onClick={() => {setShowCreateForm(false); resetForm();}}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  required
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  rows={3}
                  placeholder="Event description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type *
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => handleFormChange('eventType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  required
                >
                  <option value="">Select event type</option>
                  {Object.entries(eventTypeConfigs).map(([key, type]) => (
                    <option key={key} value={key}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleFormChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleFormChange('endDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  placeholder="Event location (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Priority
                </label>
                <div className="flex gap-4">
                  {(['low', 'medium', 'high'] as EventPriority[]).map(priority => (
                    <label key={priority} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={priority}
                        checked={formData.priority === priority}
                        onChange={(e) => handleFormChange('priority', e.target.value)}
                        className="mr-2 text-blue-600"
                      />
                      <span className="capitalize text-gray-700">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAllDay}
                    onChange={(e) => handleFormChange('isAllDay', e.target.checked)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-gray-700">All Day Event</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {setShowCreateForm(false); resetForm();}}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={createEvent}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Edit Modal */}
      {showEditForm && editingEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>
              <button
                onClick={() => {setShowEditForm(false); setEditingEvent(null); resetForm();}}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  required
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  rows={3}
                  placeholder="Event description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type *
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => handleFormChange('eventType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  required
                >
                  <option value="">Select event type</option>
                  {Object.entries(eventTypeConfigs).map(([key, type]) => (
                    <option key={key} value={key}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleFormChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleFormChange('endDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  placeholder="Event location (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Priority
                </label>
                <div className="flex gap-4">
                  {(['low', 'medium', 'high'] as EventPriority[]).map(priority => (
                    <label key={priority} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={priority}
                        checked={formData.priority === priority}
                        onChange={(e) => handleFormChange('priority', e.target.value)}
                        className="mr-2 text-blue-600"
                      />
                      <span className="capitalize text-gray-700">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAllDay}
                    onChange={(e) => handleFormChange('isAllDay', e.target.checked)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-gray-700">All Day Event</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {setShowEditForm(false); setEditingEvent(null); resetForm();}}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={updateEvent}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
                {selectedEvent.description && (
                  <p className="text-gray-600 mt-1">{selectedEvent.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border bg-${getEventColor(selectedEvent.eventType)}-100 text-${getEventColor(selectedEvent.eventType)}-800 border-${getEventColor(selectedEvent.eventType)}-200`}>
                  {eventTypeConfigs[selectedEvent.eventType]?.label}
                </span>
                <span className={`px-2 py-1 rounded text-xs border ${priorityColors[selectedEvent.priority]}`}>
                  {selectedEvent.priority} priority
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{formatEventDate(selectedEvent.startDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{formatEventTime(selectedEvent.startDate)}</span>
                  {selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.startDate && (
                    <span> - {formatEventTime(selectedEvent.endDate)}</span>
                  )}
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
              </div>

              {selectedEvent.creator && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Created by: <span className="font-medium">{selectedEvent.creator.name}</span>
                  </p>
                </div>
              )}

              {/* Event Actions */}
              <div className="flex gap-3 pt-4">
                {canEditEvent(selectedEvent) ? (
                  <>
                    <button
                      onClick={() => startEditingEvent(selectedEvent)}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                    >
                      Edit Event
                    </button>
                    <button
                      onClick={() => deleteEvent(selectedEvent.id)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Deleting...' : 'Delete Event'}
                    </button>
                  </>
                ) : (
                  <div className="text-center text-gray-500 text-sm py-2">
                    You can only edit events that you created
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentCalendarDashboard;