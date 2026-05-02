import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dismissedNotifs');
    return saved ? JSON.parse(saved) : [];
  });
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userRole = userInfo?.user?.role || userInfo?.role;
  const token = userInfo?.token;

  useEffect(() => {
    if (!token || !userRole || userRole === 'admin') return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/negotiations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          let filtered = [];
          
          if (userRole === 'farmer') {
            // Farmers see PENDING requests
            filtered = data.filter((n: any) => n.status === 'PENDING' && !dismissedIds.includes(n._id));
          } else if (userRole === 'consumer') {
            // Consumers see ACCEPTED or REJECTED requests
            filtered = data.filter((n: any) => (n.status === 'ACCEPTED' || n.status === 'REJECTED') && !dismissedIds.includes(n._id));
          }
          
          setNotifications(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token, userRole, dismissedIds]);

  const markAsRead = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    localStorage.setItem('dismissedNotifs', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const allIds = [...dismissedIds, ...notifications.map(n => n._id)];
    setDismissedIds(allIds);
    localStorage.setItem('dismissedNotifs', JSON.stringify(allIds));
  };

  if (!token || userRole === 'admin') return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <span className="font-semibold">Notifications</span>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-1 text-xs">
              <Check className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem key={notif._id} className="p-0 border-b last:border-0 relative group">
                <Link to={`/${userRole}/dashboard`} className="flex flex-col gap-1 w-full p-4 pr-10 focus:bg-muted hover:bg-muted cursor-pointer transition-colors outline-none">
                  {userRole === 'farmer' ? (
                    <>
                      <span className="text-sm font-medium">New Offer Received</span>
                      <span className="text-xs text-muted-foreground">
                        {notif.consumer?.name} offered ₹{notif.requestedPrice}/{notif.product?.unit} for {notif.product?.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium">
                        Offer {notif.status === 'ACCEPTED' ? 'Accepted' : 'Rejected'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Farmer {notif.farmer?.name} has {notif.status.toLowerCase()} your offer for {notif.product?.name}
                      </span>
                    </>
                  )}
                </Link>
                <button
                  onClick={(e) => markAsRead(e, notif._id)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Mark as read"
                >
                  <X className="h-4 w-4" />
                </button>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
