import { format, addMinutes, isPast, isToday, startOfDay } from 'date-fns';

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatTime(date: Date): string {
  return format(date, 'h:mm a');
}

export function formatDate(date: Date): string {
  return format(date, 'MMMM d, yyyy');
}

export function formatDateTime(date: Date): string {
  return format(date, 'MMM d, yyyy h:mm a');
}

export function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

export function isSlotAvailable(slotStart: Date): boolean {
  return !isPast(slotStart) || isToday(slotStart);
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  duration: number,
  date: Date
): Date[] {
  const slots: Date[] = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const slotStart = new Date(date);
  slotStart.setHours(startHour, startMin, 0, 0);

  const slotEnd = new Date(date);
  slotEnd.setHours(endHour, endMin, 0, 0);

  let currentSlot = new Date(slotStart);
  while (currentSlot.getTime() + duration * 60000 <= slotEnd.getTime()) {
    slots.push(new Date(currentSlot));
    currentSlot = addMinutes(currentSlot, duration);
  }

  return slots;
}
