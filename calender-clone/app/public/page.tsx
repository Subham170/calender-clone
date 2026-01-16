'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { eventTypesApi } from '@/lib/api';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface EventType {
  id: number;
  title: string;
  description?: string;
  duration: number;
  slug: string;
  is_active: boolean;
  user_name: string;
}

export default function PublicPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    try {
      const response = await eventTypesApi.getAll();
      // Filter only active event types
      const activeEventTypes = response.data.filter((et: EventType) => et.is_active);
      setEventTypes(activeEventTypes);
    } catch (error) {
      console.error('Error fetching event types:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Calendar Clone</h1>
              <p className="text-gray-400 text-sm">Book a meeting with us</p>
            </div>
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Admin Dashboard →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Available Event Types</h2>
          <p className="text-gray-400 text-lg">
            Select an event type below to book a time slot
          </p>
        </div>

        {eventTypes.length === 0 ? (
          <div className="text-center py-16">
            <Calendar size={64} className="mx-auto mb-4 text-gray-600" />
            <p className="text-xl text-gray-400 mb-2">No events available</p>
            <p className="text-sm text-gray-500">
              There are currently no active event types to book.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventTypes.map((eventType) => (
              <Link
                key={eventType.id}
                href={`/book/${eventType.slug}`}
                className="group bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 hover:border-blue-600 hover:bg-[#1f1f1f] transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                      {eventType.title}
                    </h3>
                    {eventType.description && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {eventType.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight 
                    size={20} 
                    className="text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" 
                  />
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} />
                    <span>{formatDuration(eventType.duration)}</span>
                  </div>
                  <div className="text-xs font-mono text-gray-500">
                    /{eventType.slug}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Hosted by</span>
                    <span className="text-sm text-gray-300">{eventType.user_name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[#2a2a2a] text-center">
          <p className="text-sm text-gray-500">
            Powered by Calendar Clone
          </p>
        </div>
      </main>
    </div>
  );
}
