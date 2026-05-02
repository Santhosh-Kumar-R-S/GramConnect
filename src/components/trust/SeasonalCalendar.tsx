import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Calendar, Leaf } from 'lucide-react';

interface CropSchedule {
  name: string;
  months: number[];
  notes?: string;
}

interface SeasonalCalendarProps {
  schedule: { crops: CropSchedule[] } | null;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_MONTH = new Date().getMonth() + 1; // 1-12

export const SeasonalCalendar = ({ schedule }: SeasonalCalendarProps) => {
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  if (!schedule || !schedule.crops || schedule.crops.length === 0) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6 text-center text-muted-foreground flex flex-col items-center">
          <Calendar className="h-8 w-8 mb-2 opacity-50" />
          <p>This farmer hasn't updated their seasonal calendar yet.</p>
        </CardContent>
      </Card>
    );
  }

  const activeCrops = selectedCrop 
    ? schedule.crops.filter(c => c.name === selectedCrop)
    : schedule.crops;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Seasonal Availability</h3>
        </div>

        {/* Crop Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCrop(null)}
            className={cn(
              "text-xs px-3 py-1 rounded-full border transition-colors",
              selectedCrop === null 
                ? "bg-primary text-primary-foreground border-primary" 
                : "border-border hover:border-primary/50 text-muted-foreground"
            )}
          >
            All Crops
          </button>
          {schedule.crops.map((crop) => (
            <button
              key={crop.name}
              onClick={() => setSelectedCrop(crop.name)}
              className={cn(
                "text-xs px-3 py-1 rounded-full border transition-colors capitalize",
                selectedCrop === crop.name 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "border-border hover:border-primary/50 text-muted-foreground"
              )}
            >
              <Leaf className="h-3 w-3 inline mr-1" />
              {crop.name}
            </button>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {MONTHS.map((monthName, index) => {
            const monthNumber = index + 1;
            const isCurrentMonth = monthNumber === CURRENT_MONTH;
            
            // Find which active crops are available in this month
            const availableCrops = activeCrops.filter(c => c.months.includes(monthNumber));
            const isAvailable = availableCrops.length > 0;

            return (
              <div
                key={monthName}
                className={cn(
                  "relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300",
                  isCurrentMonth ? "ring-2 ring-primary ring-offset-1 border-primary" : "border-border",
                  isAvailable ? "bg-green-50 border-green-200" : "bg-muted/20"
                )}
              >
                {isCurrentMonth && (
                  <span className="absolute -top-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
                    NOW
                  </span>
                )}
                <span className={cn(
                  "font-medium text-sm",
                  isAvailable ? "text-green-800" : "text-muted-foreground"
                )}>
                  {monthName}
                </span>
                
                {/* Dots indicating number of crops */}
                <div className="flex gap-0.5 mt-1.5 h-1.5">
                  {availableCrops.slice(0, 3).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  ))}
                  {availableCrops.length > 3 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 opacity-50" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Notes section for selected crop */}
        {selectedCrop && activeCrops[0]?.notes && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <strong>Notes for {selectedCrop}:</strong> {activeCrops[0].notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
