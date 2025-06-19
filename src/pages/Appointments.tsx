import React, { useState, useEffect } from 'react';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiVideo,
  FiMapPin,
  FiPlus,
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

export const Appointments: React.FC = () => {
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

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Appointments</h1>
          <p className='text-gray-600 mt-1'>
            Schedule and manage your consultation appointments
          </p>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className='btn btn-primary flex items-center gap-2'
        >
          <FiPlus className='h-4 w-4' />
          Book Appointment
        </button>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>
          Upcoming Appointments
        </h2>
        {upcomingAppointments.length > 0 ? (
          <div className='grid gap-4'>
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className='card hover:shadow-lg transition-shadow'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <FiUser className='h-5 w-5 text-gray-400' />
                      <h3 className='font-semibold text-gray-900'>
                        {appointment.consultantName}
                      </h3>
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          APPOINTMENT_STATUS[appointment.status].color
                        )}
                      >
                        {APPOINTMENT_STATUS[appointment.status].label}
                      </span>
                    </div>

                    <div className='space-y-2 text-sm text-gray-600'>
                      <div className='flex items-center gap-2'>
                        <FiCalendar className='h-4 w-4' />
                        <span>{formatDateTime(appointment.dateTime)}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        {appointment.type === 'virtual' ? (
                          <>
                            <FiVideo className='h-4 w-4' />
                            <span>Virtual Meeting</span>
                          </>
                        ) : (
                          <>
                            <FiMapPin className='h-4 w-4' />
                            <span>In-Person</span>
                          </>
                        )}
                      </div>
                      {appointment.notes && (
                        <p className='text-gray-500 mt-2'>
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    {appointment.type === 'virtual' &&
                      new Date(appointment.dateTime) <= new Date() && (
                        <button
                          onClick={() => handleJoinMeeting(appointment.id)}
                          className='btn btn-primary btn-sm'
                        >
                          Join Meeting
                        </button>
                      )}
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className='btn btn-outline btn-sm'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='card text-center py-12'>
            <FiCalendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500'>No upcoming appointments</p>
            <button
              onClick={() => setShowBookingModal(true)}
              className='btn btn-primary mt-4'
            >
              Book Your First Appointment
            </button>
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            Past Appointments
          </h2>
          <div className='grid gap-4'>
            {pastAppointments.map((appointment) => (
              <div key={appointment.id} className='card opacity-75'>
                <div className='flex items-start justify-between'>
                  <div>
                    <div className='flex items-center gap-3 mb-2'>
                      <h3 className='font-medium text-gray-900'>
                        {appointment.consultantName}
                      </h3>
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          APPOINTMENT_STATUS[appointment.status].color
                        )}
                      >
                        {APPOINTMENT_STATUS[appointment.status].label}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      {formatDateTime(appointment.dateTime)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className='fixed inset-0 z-50 overflow-y-auto'>
          <div className='flex items-center justify-center min-h-screen px-4'>
            <div
              className='fixed inset-0 bg-gray-500 bg-opacity-75'
              onClick={() => setShowBookingModal(false)}
            />

            <div className='relative bg-white rounded-lg max-w-2xl w-full p-6'>
              <h2 className='text-xl font-bold text-gray-900 mb-4'>
                Book New Appointment
              </h2>

              <div className='space-y-4'>
                <div>
                  <label className='label'>Select Date</label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    showTimeSelect // <-- Add this
                    timeFormat='HH:mm'
                    timeIntervals={15} // or 30 based on your slots
                    dateFormat='MMMM d, yyyy h:mm aa'
                    minDate={new Date()}
                    className='input'
                  />
                </div>

                <div>
                  <label className='label'>Appointment Type</label>
                  <div className='flex gap-4'>
                    <label className='flex items-center'>
                      <input
                        type='radio'
                        value='in_person'
                        checked={appointmentType === 'in_person'}
                        onChange={(e) =>
                          setAppointmentType(e.target.value as 'in_person')
                        }
                        className='mr-2'
                      />
                      In-Person
                    </label>
                    <label className='flex items-center'>
                      <input
                        type='radio'
                        value='virtual'
                        checked={appointmentType === 'virtual'}
                        onChange={(e) =>
                          setAppointmentType(e.target.value as 'virtual')
                        }
                        className='mr-2'
                      />
                      Virtual
                    </label>
                  </div>
                </div>

                {availableSlots.length > 0 && (
                  <div>
                    <label className='label'>Available Time Slots</label>
                    <div className='space-y-3'>
                      {availableSlots.map((slot) => (
                        <div
                          key={slot.consultantId}
                          className='border rounded-lg p-3'
                        >
                          <p className='font-medium text-gray-900 mb-2'>
                            {slot.consultantName}
                          </p>
                          <div className='grid grid-cols-4 gap-2'>
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
                                  'py-2 px-3 rounded text-sm font-medium transition-colors',
                                  selectedSlot?.consultantId ===
                                    slot.consultantId &&
                                    selectedSlot?.time === timeSlot.time
                                    ? 'bg-primary-600 text-white'
                                    : timeSlot.available
                                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
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
                  <label htmlFor='notes' className='label'>
                    Notes (Optional)
                  </label>
                  <textarea
                    id='notes'
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className='input'
                    placeholder="Any specific topics you'd like to discuss..."
                  />
                </div>
              </div>

              <div className='mt-6 flex justify-end gap-3'>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className='btn btn-outline'
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookAppointment}
                  // disabled={!selectedSlot || isBooking}
                  className='btn btn-primary flex items-center'
                >
                  {isBooking ? (
                    <LoadingSpinner size='sm' />
                  ) : (
                    'Book Appointment'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
