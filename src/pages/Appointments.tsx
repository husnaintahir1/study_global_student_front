import React, { useState, useEffect } from 'react';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiVideo,
  FiMapPin,
  FiPlus,
  FiX,
  FiCheck,
  FiMessageSquare,
  FiPhone,
  FiGlobe,
  FiMonitor,
  FiUsers,
  FiFileText,
  FiEdit3,
} from 'react-icons/fi';
import {
  appointmentService,
  AvailableSlot,
} from '@/services/appointment.service';
import { Appointment } from '@/types';
import { APPOINTMENT_STATUS } from '@/utils/constants';
import { formatDateTime, cn } from '@/utils/helpers';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';

export const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{
    consultantId: string;
    time: string;
  } | null>(null);
  const [appointmentType, setAppointmentType] = useState<
    'in_person' | 'virtual'
  >('in_person');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate) return;

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const slots = await appointmentService.getAvailableSlots(dateStr);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate) {
      toast.error('Please select a date and time slot');
      return;
    }

    setIsBooking(true);
    try {
      const dateTime = new Date(selectedDate);

      await appointmentService.bookAppointment({
        dateTime: dateTime.toISOString(),
        type: appointmentType,
        notes: notes.trim() || undefined,
      });

      toast.success('Appointment booked successfully');
      setShowBookingModal(false);
      resetBookingForm();
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to book appointment');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await appointmentService.cancelAppointment(id);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const handleJoinMeeting = async (appointmentId: string) => {
    try {
      const { meetingUrl } = await appointmentService.joinVirtualMeeting(
        appointmentId
      );
      window.open(meetingUrl, '_blank');
    } catch (error) {
      toast.error('Failed to join meeting');
    }
  };

  const resetBookingForm = () => {
    setSelectedDate(new Date());
    setSelectedSlot(null);
    setAppointmentType('in_person');
    setNotes('');
    setAvailableSlots([]);
  };

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === 'scheduled'
  );
  const pastAppointments = appointments.filter(
    (apt) => apt.status !== 'scheduled'
  );

  const getStatusConfig = (status: string) => {
    const configs = {
      scheduled: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: FiClock,
      },
      completed: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: FiCheck,
      },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: FiX },
      rescheduled: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: FiCalendar,
      },
    };
    return configs[status] || configs.scheduled;
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Background decorations */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl' />
      </div>

      <div className='relative max-w-7xl mx-auto px-6 py-8 space-y-8'>
        {/* Header */}
        <div className='flex justify-between items-start'>
          <div className='text-center lg:text-left'>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4'>
              Appointment Management
            </h1>
            <p className='text-lg text-gray-600 max-w-2xl'>
              Schedule consultations with our expert advisors and manage your
              meetings seamlessly
            </p>
          </div>
          <button
            onClick={() => setShowBookingModal(true)}
            className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105'
          >
            <FiPlus className='h-5 w-5' />
            Book New Appointment
          </button>
        </div>

        {/* Stats Overview */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-3xl font-bold text-blue-600'>
                  {upcomingAppointments.length}
                </p>
                <p className='text-sm text-blue-700 mt-1'>Upcoming</p>
              </div>
              <div className='p-3 bg-blue-100 rounded-xl'>
                <FiCalendar className='h-6 w-6 text-blue-600' />
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-3xl font-bold text-green-600'>
                  {
                    pastAppointments.filter((a) => a.status === 'completed')
                      .length
                  }
                </p>
                <p className='text-sm text-green-700 mt-1'>Completed</p>
              </div>
              <div className='p-3 bg-green-100 rounded-xl'>
                <FiCheck className='h-6 w-6 text-green-600' />
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-3xl font-bold text-purple-600'>
                  {appointments.filter((a) => a.type === 'virtual').length}
                </p>
                <p className='text-sm text-purple-700 mt-1'>Virtual Meetings</p>
              </div>
              <div className='p-3 bg-purple-100 rounded-xl'>
                <FiVideo className='h-6 w-6 text-purple-600' />
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-3xl font-bold text-orange-600'>
                  {appointments.length}
                </p>
                <p className='text-sm text-orange-700 mt-1'>Total Sessions</p>
              </div>
              <div className='p-3 bg-orange-100 rounded-xl'>
                <FiUsers className='h-6 w-6 text-orange-600' />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden'>
          <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200/50'>
            <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
              Upcoming Appointments
            </h2>
            <p className='text-gray-600'>
              Your scheduled consultations and meetings
            </p>
          </div>

          <div className='p-6'>
            {upcomingAppointments.length > 0 ? (
              <div className='space-y-6'>
                {upcomingAppointments.map((appointment) => {
                  const statusConfig = getStatusConfig(appointment.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={appointment.id}
                      className='border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50 group'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-4 mb-4'>
                            <div className='p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors'>
                              <FiUser className='h-6 w-6 text-blue-600' />
                            </div>
                            <div>
                              <h3 className='text-xl font-semibold text-gray-900'>
                                {appointment.consultantName}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color} mt-1`}
                              >
                                <StatusIcon className='h-3 w-3' />
                                {APPOINTMENT_STATUS[appointment.status]
                                  ?.label || appointment.status}
                              </span>
                            </div>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl'>
                              <FiCalendar className='h-5 w-5 text-gray-500' />
                              <span className='font-medium text-gray-900'>
                                {formatDateTime(appointment.dateTime)}
                              </span>
                            </div>
                            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl'>
                              {appointment.type === 'virtual' ? (
                                <>
                                  <FiVideo className='h-5 w-5 text-purple-500' />
                                  <span className='font-medium text-gray-900'>
                                    Virtual Meeting
                                  </span>
                                </>
                              ) : (
                                <>
                                  <FiMapPin className='h-5 w-5 text-green-500' />
                                  <span className='font-medium text-gray-900'>
                                    In-Person Meeting
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {appointment.notes && (
                            <div className='mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl'>
                              <div className='flex items-start gap-2'>
                                <FiMessageSquare className='h-4 w-4 text-blue-600 mt-0.5' />
                                <p className='text-sm text-blue-800'>
                                  {appointment.notes}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className='flex flex-col gap-3 ml-6'>
                          {appointment.type === 'virtual' &&
                            new Date(appointment.dateTime) <= new Date() && (
                              <button
                                onClick={() =>
                                  handleJoinMeeting(appointment.id)
                                }
                                className='bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl'
                              >
                                <FiVideo className='h-4 w-4' />
                                Join Meeting
                              </button>
                            )}
                          <button
                            onClick={() =>
                              handleCancelAppointment(appointment.id)
                            }
                            className='px-6 py-3 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center gap-2'
                          >
                            <FiX className='h-4 w-4' />
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='text-center py-16'>
                <div className='p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center'>
                  <FiCalendar className='h-12 w-12 text-gray-400' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  No Upcoming Appointments
                </h3>
                <p className='text-gray-500 mb-6 max-w-md mx-auto'>
                  Schedule your first consultation with our expert advisors to
                  get personalized guidance
                </p>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all'
                >
                  Book Your First Appointment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden'>
            <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200/50'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
                Past Appointments
              </h2>
              <p className='text-gray-600'>
                Your appointment history and completed sessions
              </p>
            </div>

            <div className='p-6'>
              <div className='space-y-4'>
                {pastAppointments.map((appointment) => {
                  const statusConfig = getStatusConfig(appointment.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={appointment.id}
                      className='border border-gray-200 rounded-xl p-4 bg-gray-50/50'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                          <div className='p-2 bg-gray-200 rounded-lg'>
                            <FiUser className='h-5 w-5 text-gray-500' />
                          </div>
                          <div>
                            <h4 className='font-semibold text-gray-900'>
                              {appointment.consultantName}
                            </h4>
                            <p className='text-sm text-gray-600'>
                              {formatDateTime(appointment.dateTime)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
                        >
                          <StatusIcon className='h-3 w-3' />
                          {APPOINTMENT_STATUS[appointment.status]?.label ||
                            appointment.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && (
          <div className='fixed inset-0 z-50 overflow-y-auto'>
            <div className='flex items-center justify-center min-h-screen px-4'>
              <div
                className='fixed inset-0 bg-gray-900/50 backdrop-blur-sm'
                onClick={() => setShowBookingModal(false)}
              />

              <div className='relative bg-white/95 backdrop-blur-md rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-gray-200/50'>
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                    Book New Appointment
                  </h2>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors'
                  >
                    <FiX className='h-6 w-6' />
                  </button>
                </div>

                <div className='space-y-6'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-3'>
                      Select Date & Time
                    </label>
                    <div className='border border-gray-300 rounded-xl p-4 bg-gray-50'>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        showTimeSelect
                        timeFormat='HH:mm'
                        timeIntervals={15}
                        dateFormat='MMMM d, yyyy h:mm aa'
                        minDate={new Date()}
                        className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-3'>
                      Meeting Type
                    </label>
                    <div className='grid grid-cols-2 gap-4'>
                      <label
                        className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          appointmentType === 'in_person'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type='radio'
                          value='in_person'
                          checked={appointmentType === 'in_person'}
                          onChange={(e) =>
                            setAppointmentType(e.target.value as 'in_person')
                          }
                          className='sr-only'
                        />
                        <div className='flex items-center gap-3'>
                          <FiMapPin className='h-6 w-6 text-green-600' />
                          <div>
                            <p className='font-medium text-gray-900'>
                              In-Person
                            </p>
                            <p className='text-sm text-gray-600'>
                              Face-to-face meeting
                            </p>
                          </div>
                        </div>
                      </label>

                      <label
                        className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          appointmentType === 'virtual'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type='radio'
                          value='virtual'
                          checked={appointmentType === 'virtual'}
                          onChange={(e) =>
                            setAppointmentType(e.target.value as 'virtual')
                          }
                          className='sr-only'
                        />
                        <div className='flex items-center gap-3'>
                          <FiVideo className='h-6 w-6 text-purple-600' />
                          <div>
                            <p className='font-medium text-gray-900'>Virtual</p>
                            <p className='text-sm text-gray-600'>
                              Online meeting
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {availableSlots.length > 0 && (
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-3'>
                        Available Consultants & Time Slots
                      </label>
                      <div className='space-y-4 max-h-64 overflow-y-auto'>
                        {availableSlots.map((slot) => (
                          <div
                            key={slot.consultantId}
                            className='border border-gray-200 rounded-xl p-4 bg-gray-50'
                          >
                            <p className='font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                              <FiUser className='h-4 w-4' />
                              {slot.consultantName}
                            </p>
                            <div className='grid grid-cols-3 md:grid-cols-4 gap-2'>
                              {slot.timeSlots.map((timeSlot) => (
                                <button
                                  key={timeSlot.time}
                                  onClick={() =>
                                    setSelectedSlot({
                                      consultantId: slot.consultantId,
                                      time: timeSlot.time,
                                    })
                                  }
                                  disabled={!timeSlot.available}
                                  className={cn(
                                    'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                                    selectedSlot?.consultantId ===
                                      slot.consultantId &&
                                      selectedSlot?.time === timeSlot.time
                                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                      : timeSlot.available
                                      ? 'bg-white border border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-gray-900'
                                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  )}
                                >
                                  {timeSlot.time}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor='notes'
                      className='block text-sm font-semibold text-gray-700 mb-3'
                    >
                      Notes (Optional)
                    </label>
                    <textarea
                      id='notes'
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all resize-none'
                      placeholder="Any specific topics you'd like to discuss or questions you have..."
                    />
                  </div>
                </div>

                <div className='mt-8 flex justify-end gap-4'>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className='px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBookAppointment}
                    disabled={isBooking}
                    className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl'
                  >
                    {isBooking ? (
                      <>
                        <LoadingSpinner size='sm' />
                        Booking...
                      </>
                    ) : (
                      <>
                        <FiCheck className='h-4 w-4' />
                        Book Appointment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
