'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import EventTypeCard from '@/components/EventTypeCard';
import { eventTypesApi } from '@/lib/api';
import { testBackendConnection } from '@/lib/testConnection';
import { Plus } from 'lucide-react';

interface EventType {
  id: number;
  title: string;
  description?: string;
  duration: number;
  slug: string;
  is_active: boolean;
}

export default function Home() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    slug: '',
  });

  useEffect(() => {
    // Test backend connection on mount
    testBackendConnection().then((connected) => {
      if (!connected) {
        console.warn('⚠️ Backend server may not be running. Please check:');
        console.warn('1. Is the backend server running on http://localhost:5000?');
        console.warn('2. Is the database initialized and seeded?');
        console.warn('3. Check browser console for CORS errors');
      }
    });
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    try {
      const response = await eventTypesApi.getAll();
      setEventTypes(response.data);
    } catch (error) {
      console.error('Error fetching event types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number, isActive: boolean) => {
    try {
      await eventTypesApi.update(id, { is_active: isActive });
      fetchEventTypes();
    } catch (error) {
      console.error('Error toggling event type:', error);
      alert('Failed to update event type');
    }
  };

  const handleEdit = (eventType: EventType) => {
    setEditingEvent(eventType);
    setFormData({
      title: eventType.title,
      description: eventType.description || '',
      duration: eventType.duration,
      slug: eventType.slug,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await eventTypesApi.delete(id);
      fetchEventTypes();
    } catch (error) {
      console.error('Error deleting event type:', error);
      alert('Failed to delete event type');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await eventTypesApi.update(editingEvent.id, formData);
      } else {
        await eventTypesApi.create(formData);
      }
      setShowModal(false);
      setEditingEvent(null);
      setFormData({ title: '', description: '', duration: 30, slug: '' });
      fetchEventTypes();
    } catch (error: any) {
      console.error('Error saving event type:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save event type';
      console.error('Full error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      alert(errorMessage);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Event types</h1>
              <p className="text-gray-400">
                Configure different events for people to book on your calendar.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingEvent(null);
                setFormData({ title: '', description: '', duration: 30, slug: '' });
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <Plus size={20} />
              New
            </button>
          </div>

          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : eventTypes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No event types yet. Create your first event type to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {eventTypes.map((eventType) => (
                <EventTypeCard
                  key={eventType.id}
                  eventType={eventType}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingEvent ? 'Edit Event Type' : 'Create Event Type'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: editingEvent ? formData.slug : generateSlug(e.target.value),
                    });
                  }}
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-blue-600"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  required
                  min="15"
                  step="15"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-blue-600"
                  pattern="[a-z0-9-]+"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only lowercase letters, numbers, and hyphens
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  {editingEvent ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                    setFormData({ title: '', description: '', duration: 30, slug: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-[#2a2a2a] text-white rounded-lg font-medium hover:bg-[#3a3a3a] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
