'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { eventTypesApi, bookingsApi } from '@/lib/api';
import { formatDate, formatTime, generateTimeSlots, isSlotAvailable } from '@/lib/utils';
import { Calendar, Clock, User, Mail } from 'lucide-react';
import { addDays, format, startOfWeek, isSameDay } from 'date-fns';

interface EventType {
  id: number;
  title: string;
  description?: string;
  duration: number;
  slug: string;
  user_name: string;
  user_timezone: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

export default function BookingPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [step, setStep] = useState<'date' | 'time' | 'details' | 'confirmation'>('date');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    fetchEventType();
  }, [slug]);

  useEffect(() => {
    if (eventType && selectedDate) {
      fetchAvailableSlots();
    }
  }, [eventType, selectedDate]);

  const fetchEventType = async () => {
    try {
      const response = await eventTypesApi.getBySlug(slug);
      setEventType(response.data);
    } catch (error) {
      console.error('Error fetching event type:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!eventType) return;
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await bookingsApi.getAvailableSlots(slug, dateStr);
      setAvailableSlots(response.data.availableSlots || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStep('time');
  };

  const handleSlotSelect = (slotStart: string) => {
    setSelectedSlot(slotStart);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !formData.name || !formData.email) return;

    setSubmitting(true);
    try {
      const response = await bookingsApi.create(slug, {
        booker_name: formData.name,
        booker_email: formData.email,
        start_time: selectedSlot,
      });
      setBookingData(response.data);
      setStep('confirmation');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      alert(error.response?.data?.error || 'Failed to create booking. This slot may have been booked.');
      fetchAvailableSlots();
    } finally {
      setSubmitting(false);
    }
  };

  // Generate calendar dates (next 4 weeks)
  const today = new Date();
  const startDate = startOfWeek(today, { weekStartsOn: 0 });
  const calendarDates: Date[] = [];
  for (let i = 0; i < 28; i++) {
    calendarDates.push(addDays(startDate, i));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!eventType) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-xl mb-2">Event not found</p>
          <p className="text-sm">The event type you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{eventType.title}</h1>
          {eventType.description && (
            <p className="text-gray-400 mb-4">{eventType.description}</p>
          )}
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              <Clock size={16} />
              <span>{eventType.duration} minutes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User size={16} />
              <span>{eventType.user_name}</span>
            </div>
          </div>
        </div>

        {/* Booking Steps */}
        {step === 'date' && (
          <div>
            <h2 className="text-xl font-semibold mb-6 text-center">Select a date</h2>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm text-gray-400 font-medium py-2">
                  {day}
                </div>
              ))}
              {calendarDates.map((date, index) => {
                const isPast = date < today && !isSameDay(date, today);
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, today);

                return (
                  <button
                    key={index}
                    onClick={() => !isPast && handleDateSelect(date)}
                    disabled={isPast}
                    className={`aspect-square rounded-lg transition-colors ${
                      isPast
                        ? 'text-gray-600 cursor-not-allowed'
                        : isSelected
                        ? 'bg-white text-black'
                        : isToday
                        ? 'bg-[#2a2a2a] text-white border-2 border-white'
                        : 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]'
                    }`}
                  >
                    {format(date, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'time' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {formatDate(selectedDate)}
              </h2>
              <button
                onClick={() => setStep('date')}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Change date
              </button>
            </div>
            {availableSlots.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No available time slots for this date.</p>
                <button
                  onClick={() => setStep('date')}
                  className="mt-4 text-blue-400 hover:text-blue-300"
                >
                  Choose another date
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlotSelect(slot.start)}
                    className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-blue-600 hover:bg-[#2a2a2a] transition-colors"
                  >
                    {formatTime(new Date(slot.start))}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'details' && selectedSlot && (
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="text-center mb-4">
                <p className="text-gray-400">{formatDate(selectedDate)}</p>
                <p className="text-xl font-semibold">{formatTime(new Date(selectedSlot))}</p>
              </div>
              <button
                onClick={() => setStep('time')}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                ← Change time
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User size={16} className="inline mr-2" />
                  Your name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-blue-600"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        )}

        {step === 'confirmation' && bookingData && (
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-gray-400 mb-6">
                Your booking has been successfully created.
              </p>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 text-left space-y-3">
              <div>
                <p className="text-sm text-gray-400">Event</p>
                <p className="font-semibold">{eventType.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Date & Time</p>
                <p className="font-semibold">{formatDateTime(new Date(bookingData.start_time))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="font-semibold">{eventType.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Booker</p>
                <p className="font-semibold">{bookingData.booker_name}</p>
                <p className="text-sm text-gray-400">{bookingData.booker_email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
