import { CheckCircle2, Circle, Package, Truck, ShoppingBag, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { status: 'Pending',   label: 'Order Placed',  icon: ShoppingBag },
  { status: 'Accepted',  label: 'Confirmed',      icon: CheckCircle2 },
  { status: 'Packed',    label: 'Packed',         icon: Package },
  { status: 'Shipped',   label: 'Shipped',        icon: Truck },
  { status: 'Delivered', label: 'Delivered',      icon: CheckCircle2 },
];

interface TimelineEntry {
  status: string;
  timestamp: string;
  note?: string;
}

interface OrderTimelineProps {
  currentStatus: string;
  statusHistory: TimelineEntry[];
}

export function OrderTimeline({ currentStatus, statusHistory }: OrderTimelineProps) {
  const isRejected = currentStatus === 'Rejected';

  const getHistoryEntry = (status: string) =>
    statusHistory?.find(h => h.status === status);

  const currentStepIndex = STEPS.findIndex(s => s.status === currentStatus);

  return (
    <div className="py-4">
      {isRejected ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <XCircle className="h-8 w-8 text-red-500 shrink-0" />
          <div>
            <p className="font-semibold text-red-700">Order Rejected</p>
            <p className="text-sm text-red-500">
              {getHistoryEntry('Rejected')?.note || 'This order has been rejected.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {STEPS.map((step, index) => {
            const isDone = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const historyEntry = getHistoryEntry(step.status);
            const Icon = step.icon;

            return (
              <div key={step.status} className="flex gap-4">
                {/* Line + Icon column */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all",
                    isDone
                      ? "bg-primary border-primary text-white"
                      : "bg-background border-border text-muted-foreground"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      "w-0.5 flex-1 my-1 min-h-[32px]",
                      isDone && index < currentStepIndex ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </div>

                {/* Content column */}
                <div className="pb-6 flex-1">
                  <p className={cn(
                    "font-medium text-sm",
                    isCurrent ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.label}
                    {isCurrent && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </p>
                  {historyEntry ? (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(historyEntry.timestamp).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                      {historyEntry.note && ` · ${historyEntry.note}`}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">Pending</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
