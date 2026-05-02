import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useCart } from '@/context/CartContext';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Browse Products' },
  { href: '/farms', label: 'Know Your Farm' },
  { href: '/about', label: 'About' },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const { cartCount } = useCart();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
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
              <span className="text-sm font-medium hidden lg:inline-block">
                Hi, {(user?.user?.name || user?.name || 'User').split(' ')[0]}
              </span>
              {user?.user?.role && (
                <Button variant="ghost" asChild>
                  <Link to={`/${user.user.role}/dashboard`}>Dashboard</Link>
                </Button>
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
