import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, MapPin, ArrowRight, Leaf, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type UserRole = 'consumer' | 'farmer';

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'consumer';

  const [role, setRole] = useState<UserRole>(initialRole);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    // Farmer specific
    village: '',
    district: '',
    state: '',
    // Consumer specific
    city: '',
    address: '',
    // Coordinates
    lat: null as number | null,
    lng: null as number | null,
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        toast({
          title: "Registration Successful",
          description: "Welcome to GramConnect!",
        });
        navigate(role === 'farmer' ? '/farmer/pending' : '/consumer/dashboard');
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: data.message || "Something went wrong",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect to server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Gram<span className="text-primary">Connect</span>
            </span>
          </Link>

          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-6">
            Join India's trusted farm-to-consumer marketplace
          </p>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              type="button"
              onClick={() => setRole('consumer')}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                role === 'consumer'
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              )}
            >
              <div className="text-2xl mb-2">🛒</div>
              <div className="font-medium">I'm a Consumer</div>
              <p className="text-sm text-muted-foreground">Buy fresh produce</p>
              {role === 'consumer' && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => setRole('farmer')}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all relative",
                role === 'farmer'
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              )}
            >
              <div className="text-2xl mb-2">👨‍🌾</div>
              <div className="font-medium">I'm a Farmer</div>
              <p className="text-sm text-muted-foreground">Sell your produce</p>
              {role === 'farmer' && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      className="pl-10 pr-10 h-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button type="button" className="w-full h-12" onClick={() => setStep(2)}>
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Location Info */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                {role === 'farmer' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="village">Village Name</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="village"
                          placeholder="Your village name"
                          value={formData.village}
                          onChange={(e) => updateField('village', e.target.value)}
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="district">District</Label>
                        <Input
                          id="district"
                          placeholder="District"
                          value={formData.district}
                          onChange={(e) => updateField('district', e.target.value)}
                          className="h-12"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          placeholder="State"
                          value={formData.state}
                          onChange={(e) => updateField('state', e.target.value)}
                          className="h-12"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Farm Location (Required for Map)</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant={formData.lat ? "default" : "outline"}
                          className="w-full gap-2"
                          onClick={() => {
                            if (!navigator.geolocation) {
                              toast({ title: "Error", description: "Geolocation not supported" });
                              return;
                            }
                            navigator.geolocation.getCurrentPosition(
                              (pos) => {
                                updateField('lat', pos.coords.latitude.toString());
                                updateField('lng', pos.coords.longitude.toString());
                                toast({ title: "Success", description: "Location captured!" });
                              },
                              () => toast({ title: "Error", description: "Could not get location" })
                            );
                          }}
                        >
                          <MapPin className="h-4 w-4" />
                          {formData.lat ? "Location Captured ✓" : "Get Current Location"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        We need your location so consumers can find you on the map.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="city"
                          placeholder="Your city"
                          value={formData.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address (Optional)</Label>
                      <Input
                        id="address"
                        placeholder="Your delivery address"
                        value={formData.address}
                        onChange={(e) => updateField('address', e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 h-12" disabled={isLoading}>
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        {role === 'farmer' ? 'Submit for Approval' : 'Create Account'}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-md text-center text-primary-foreground"
        >
          <div className="text-8xl mb-8">{role === 'farmer' ? '👨‍🌾' : '🛒'}</div>
          <h2 className="text-3xl font-bold mb-4">
            {role === 'farmer'
              ? 'Grow Your Business with Us'
              : 'Fresh from Farm to You'}
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            {role === 'farmer'
              ? 'Sell directly to consumers. No middlemen. Fair prices. Trusted platform.'
              : 'Access fresh, organic produce directly from verified farmers across India.'}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
