import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Slot {
  _id: string;
  date: string;
  label: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  createdByRole: 'admin' | 'farmer';
}

interface DeliverySlotPickerProps {
  selectedSlotId: string | null;
  onSelect: (slotId: string | null) => void;
  token: string;
}

export function DeliverySlotPicker({ selectedSlotId, onSelect, token }: DeliverySlotPickerProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch('/api/slots', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSlots(data);
        }
      } catch (err) {
        console.error('Failed to fetch slots', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [token]);

  if (loading) return <p className="text-sm text-muted-foreground py-2">Loading available slots...</p>;

  if (slots.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <AlertCircle className="h-4 w-4" />
        No delivery slots available right now. You can still place an order.
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, Slot[]> = {};
  slots.forEach(slot => {
    const dateKey = new Date(slot.date).toDateString();
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(slot);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Calendar className="h-4 w-4 text-primary" />
        Select a Delivery Slot (Optional)
      </div>

      {Object.entries(grouped).map(([dateKey, daySlots]) => (
        <div key={dateKey}>
          <p className="text-xs text-muted-foreground font-medium mb-2">
            {new Date(dateKey).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {daySlots.map(slot => {
              const isFull = slot.bookedCount >= slot.maxCapacity;
              const isSelected = selectedSlotId === slot._id;
              const remainingSpots = slot.maxCapacity - slot.bookedCount;

              return (
                <button
                  key={slot._id}
                  type="button"
                  disabled={isFull}
                  onClick={() => onSelect(isSelected ? null : slot._id)}
                  className={cn(
                    "text-left p-3 rounded-xl border-2 transition-all",
                    isFull && "opacity-50 cursor-not-allowed bg-muted",
                    isSelected && !isFull && "border-primary bg-primary/5",
                    !isSelected && !isFull && "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" />
                      {slot.label}
                    </span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    {isFull && <span className="text-xs text-red-500 font-medium">Full</span>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {isFull ? 'No slots available' : `${remainingSpots} spot${remainingSpots !== 1 ? 's' : ''} left`}
                    {slot.createdByRole === 'admin' && (
                      <span className="ml-1 text-primary font-medium">· Official</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedSlotId && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => onSelect(null)}
        >
          Clear selection
        </Button>
      )}
    </div>
  );
}
