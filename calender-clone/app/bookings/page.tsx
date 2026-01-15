'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { bookingsApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Calendar, X } from 'lucide-react';

interface Booking {
  id: number;
  booker_name: string;
  booker_email: string;
  start_time: string;
  end_time: string;
  status: string;
  event_title: string;
  duration: number;
  event_slug: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? undefined : filter;
      const response = await bookingsApi.getAll(status);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    try {
      await bookingsApi.cancel(id);
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.start_time) > new Date() && b.status === 'confirmed'
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.start_time) < new Date() || b.status === 'cancelled'
  );

  const displayBookings = filter === 'all' ? bookings : filter === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Bookings</h1>
            <p className="text-gray-400">
              View and manage your bookings.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 border-b border-[#2a2a2a]">
            {(['all', 'upcoming', 'past'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 font-medium transition-colors ${
                  filter === f
                    ? 'text-white border-b-2 border-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : displayBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No bookings found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#3a3a3a] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">{booking.event_title}</h3>
                        {booking.status === 'cancelled' && (
                          <span className="px-2 py-1 text-xs bg-red-900/30 text-red-400 rounded">
                            Cancelled
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-400">
                        <p>
                          <span className="font-medium">Booker:</span> {booking.booker_name} ({booking.booker_email})
                        </p>
                        <p>
                          <span className="font-medium">Time:</span> {formatDateTime(new Date(booking.start_time))}
                        </p>
                        <p>
                          <span className="font-medium">Duration:</span> {booking.duration} minutes
                        </p>
                      </div>
                    </div>
                    {booking.status === 'confirmed' && new Date(booking.start_time) > new Date() && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="px-4 py-2 text-sm text-red-400 hover:text-red-300 border border-red-900/30 rounded-lg hover:bg-red-900/10 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
