'use client';

import { useState } from 'react';
import { Clock, ExternalLink, Copy, MoreVertical, Trash2, Edit } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface EventType {
  id: number;
  title: string;
  description?: string;
  duration: number;
  slug: string;
  is_active: boolean;
}

interface EventTypeCardProps {
  eventType: EventType;
  onToggle: (id: number, isActive: boolean) => void;
  onEdit: (eventType: EventType) => void;
  onDelete: (id: number) => void;
}

export default function EventTypeCard({ eventType, onToggle, onEdit, onDelete }: EventTypeCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${eventType.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setShowMenu(false);
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#3a3a3a] transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-white font-semibold text-lg">{eventType.title}</h3>
            {!eventType.is_active && (
              <span className="px-2 py-1 text-xs bg-[#2a2a2a] text-gray-400 rounded">Hidden</span>
            )}
          </div>
          <p className="text-sm text-gray-400 mb-3">{eventType.description || 'No description'}</p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              <Clock size={16} />
              <span>{formatDuration(eventType.duration)}</span>
            </div>
            <div className="text-xs font-mono text-gray-500">
              /{eventType.slug}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={eventType.is_active}
              onChange={(e) => onToggle(eventType.id, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#2a2a2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>

          {/* Actions */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
            >
              <MoreVertical size={18} className="text-gray-400" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-lg z-20">
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <ExternalLink size={16} />
                    Open in new tab
                  </a>
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] transition-colors w-full"
                  >
                    <Copy size={16} />
                    Copy link
                  </button>
                  <button
                    onClick={() => {
                      onEdit(eventType);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] transition-colors w-full"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this event type?')) {
                        onDelete(eventType.id);
                      }
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[#2a2a2a] transition-colors w-full"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
