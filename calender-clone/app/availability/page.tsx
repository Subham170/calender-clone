'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { availabilityApi } from '@/lib/api';
import { getDayName } from '@/lib/utils';
import { Clock, Save } from 'lucide-react';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function AvailabilityPage() {
  const [timezone, setTimezone] = useState('America/New_York');
  const [availability, setAvailability] = useState<Record<number, Array<{ start_time: string; end_time: string }>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await availabilityApi.get();
      const data = response.data;
      setTimezone(data.timezone || 'America/New_York');
      
      const grouped: Record<number, Array<{ start_time: string; end_time: string }>> = {};
      data.availability.forEach((slot: any) => {
        if (!grouped[slot.day_of_week]) {
          grouped[slot.day_of_week] = [];
        }
        grouped[slot.day_of_week].push({
          start_time: slot.start_time,
          end_time: slot.end_time,
        });
      });
      setAvailability(grouped);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = (dayOfWeek: number) => {
    const slots = availability[dayOfWeek] || [];
    setAvailability({
      ...availability,
      [dayOfWeek]: [...slots, { start_time: '09:00:00', end_time: '17:00:00' }],
    });
  };

  const removeTimeSlot = (dayOfWeek: number, index: number) => {
    const slots = availability[dayOfWeek] || [];
    const newSlots = slots.filter((_, i) => i !== index);
    if (newSlots.length === 0) {
      const { [dayOfWeek]: _, ...rest } = availability;
      setAvailability(rest);
    } else {
      setAvailability({ ...availability, [dayOfWeek]: newSlots });
    }
  };

  const updateTimeSlot = (dayOfWeek: number, index: number, field: 'start_time' | 'end_time', value: string) => {
    const slots = availability[dayOfWeek] || [];
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setAvailability({ ...availability, [dayOfWeek]: newSlots });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const availabilityArray = Object.entries(availability).flatMap(([day, slots]) =>
        slots.map((slot) => ({
          day_of_week: parseInt(day),
          start_time: slot.start_time,
          end_time: slot.end_time,
        }))
      );

      await availabilityApi.set({
        availability: availabilityArray,
        timezone,
      });
      alert('Availability saved successfully!');
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0a0a0a]">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="text-gray-400">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Availability</h1>
            <p className="text-gray-400">
              Set your available days and time slots for bookings.
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-blue-600"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div className="space-y-4">
            {DAYS.map((day) => {
              const slots = availability[day.value] || [];
              return (
                <div
                  key={day.value}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">{day.label}</h3>
                    <button
                      onClick={() => addTimeSlot(day.value)}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      + Add time slot
                    </button>
                  </div>

                  {slots.length === 0 ? (
                    <p className="text-sm text-gray-500">No availability set</p>
                  ) : (
                    <div className="space-y-3">
                      {slots.map((slot, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="time"
                            value={slot.start_time.substring(0, 5)}
                            onChange={(e) =>
                              updateTimeSlot(day.value, index, 'start_time', e.target.value + ':00')
                            }
                            className="px-3 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-blue-600"
                          />
                          <span className="text-gray-400">to</span>
                          <input
                            type="time"
                            value={slot.end_time.substring(0, 5)}
                            onChange={(e) =>
                              updateTimeSlot(day.value, index, 'end_time', e.target.value + ':00')
                            }
                            className="px-3 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-blue-600"
                          />
                          <button
                            onClick={() => removeTimeSlot(day.value, index)}
                            className="ml-auto px-3 py-2 text-sm text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
