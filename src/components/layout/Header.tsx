import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, Leaf, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useCart } from '@/context/CartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Browse Products' },
  { href: '/farms', label: 'Know Your Farm' },
  { href: '/feed', label: 'Farm Feed' },
  { href: '/about', label: 'About' },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState({ name: false, village: false, location: false, pincode: false });
  const [profileData, setProfileData] = useState({ name: '', village: '', location: '', pincode: '' });
  const location = useLocation();
  const { cartCount } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      setProfileData({
        name: parsedUser?.user?.name || parsedUser?.name || '',
        village: parsedUser?.user?.village || parsedUser?.village || '',
        location: parsedUser?.user?.location || parsedUser?.location || '',
        pincode: parsedUser?.user?.pincode || parsedUser?.pincode || '',
      });
    } else {
      setUser(null);
    }
  }, [location]);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/login');
  };

  const handleOpenProfile = () => {
    if (user) {
      setProfileData({
        name: user?.user?.name || user?.name || '',
        village: user?.user?.village || user?.village || '',
        location: user?.user?.location || user?.location || '',
        pincode: user?.user?.pincode || user?.pincode || '',
      });
    }
    setIsEditing({ name: false, village: false, location: false, pincode: false });
    setIsProfileOpen(true);
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (res.ok) {
        const updatedData = await res.json();
        const newUserObj = { ...user, user: updatedData, name: updatedData.name };
        localStorage.setItem('userInfo', JSON.stringify(newUserObj));
        setUser(newUserObj);
        setIsProfileOpen(false);
        toast({ title: 'Success', description: 'Profile updated successfully!' });
      } else {
        toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="GramConnect Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
          <span className="text-xl font-bold text-foreground">
            Gram<span className="text-primary">Connect</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks
            .filter((link) => {
              if (link.label === 'About' && user?.user?.role === 'admin') return false;
              return true;
            })
            .map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user?.user?.role !== 'admin' && (
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
          )}
          <NotificationBell />
          {user ? (
            <div className="flex items-center gap-3">
              <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogTrigger asChild>
                  <span onClick={handleOpenProfile} className="text-sm font-medium hidden lg:inline-block cursor-pointer hover:text-primary transition-colors hover:underline">
                    Hi, {(user?.user?.name || user?.name || 'User').split(' ')[0]}
                  </span>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Profile Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email (Read Only)</label>
                      <Input value={user?.user?.email || user?.email} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Name</label>
                        <Pencil 
                          className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-primary" 
                          onClick={() => setIsEditing({...isEditing, name: true})} 
                        />
                      </div>
                      {isEditing.name ? (
                        <Input 
                          value={profileData.name} 
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm p-2 bg-muted/50 rounded-md border border-transparent min-h-9 flex items-center">
                          {profileData.name || 'Not set'}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Village</label>
                        <Pencil 
                          className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-primary" 
                          onClick={() => setIsEditing({...isEditing, village: true})} 
                        />
                      </div>
                      {isEditing.village ? (
                        <Input 
                          value={profileData.village} 
                          onChange={(e) => setProfileData({...profileData, village: e.target.value})} 
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm p-2 bg-muted/50 rounded-md border border-transparent min-h-9 flex items-center">
                          {profileData.village || 'Not set'}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">City / Location</label>
                        <Pencil 
                          className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-primary" 
                          onClick={() => setIsEditing({...isEditing, location: true})} 
                        />
                      </div>
                      {isEditing.location ? (
                        <Input 
                          value={profileData.location} 
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})} 
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm p-2 bg-muted/50 rounded-md border border-transparent min-h-9 flex items-center">
                          {profileData.location || 'Not set'}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Pincode</label>
                        <Pencil 
                          className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-primary" 
                          onClick={() => setIsEditing({...isEditing, pincode: true})} 
                        />
                      </div>
                      {isEditing.pincode ? (
                        <Input 
                          value={profileData.pincode} 
                          onChange={(e) => setProfileData({...profileData, pincode: e.target.value})} 
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm p-2 bg-muted/50 rounded-md border border-transparent min-h-9 flex items-center">
                          {profileData.pincode || 'Not set'}
                        </p>
                      )}
                    </div>
                    <Button className="w-full mt-4" onClick={handleUpdateProfile}>Save Changes</Button>
                  </div>
                </DialogContent>
              </Dialog>
              {user?.user?.role && (
                <>
                  <Button variant="ghost" asChild>
                    <Link to={user.user.role === 'farmer' && user.user.status === 'pending' ? '/farmer/pending' : `/${user.user.role}/dashboard`}>Dashboard</Link>
                  </Button>
                  {user.user.role === 'consumer' && (
                    <Button variant="ghost" asChild>
                      <Link to="/consumer/wallet">Wallet</Link>
                    </Button>
                  )}
                </>
              )}
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/login">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <nav className="container py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "text-sm font-medium py-2 transition-colors",
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="outline" asChild>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
