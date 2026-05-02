import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Leaf, Calendar as CalendarIcon, Package, ArrowLeft, ShieldCheck, Camera, Heart } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { FreshnessBadge } from '@/components/trust/FreshnessBadge';
import { OrganicBadge } from '@/components/trust/OrganicBadge';
import { SeasonalCalendar } from '@/components/trust/SeasonalCalendar';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, string> = {
  vegetables: '🥬', fruits: '🍎', grains: '🌾',
  pulses: '🫘', spices: '🌶️', dairy: '🥛', other: '📦'
};

const FarmerProfile = () => {
  const { farmerId } = useParams<{ farmerId: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'updates'>('products');
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const [profRes, schedRes, updatesRes] = await Promise.all([
          fetch(`/api/farms/${farmerId}/profile`),
          fetch(`/api/seasonal/${farmerId}`),
          fetch(`/api/farm-updates/farmer/${farmerId}`)
        ]);
        if (profRes.ok) setProfile(await profRes.json());
        if (schedRes.ok) setSchedule(await schedRes.json());
        if (updatesRes.ok) setUpdates(await updatesRes.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    if (farmerId) fetch_();
  }, [farmerId]);

  if (loading) return (
    <Layout>
      <div className="container py-16 text-center text-muted-foreground animate-pulse">Loading farm profile...</div>
    </Layout>
  );

  if (!profile) return (
    <Layout>
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Farmer not found.</p>
        <Button asChild className="mt-4" variant="outline"><Link to="/farms">← Back to Map</Link></Button>
      </div>
    </Layout>
  );

  const memberYears = new Date().getFullYear() - new Date(profile.memberSince).getFullYear();

  return (
    <Layout>
      <div className="container max-w-4xl py-6">
        {/* Back */}
        <Link to="/farms" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Map
        </Link>

        {/* Hero Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6 overflow-hidden">
            {/* Cover / gradient header */}
            <div className="h-32 bg-gradient-to-r from-green-600 to-emerald-400 relative">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900')] bg-cover bg-center opacity-30" />
            </div>
            <CardContent className="p-6 -mt-10 relative">
              {/* Avatar */}
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 border-4 border-background flex items-center justify-center text-3xl shadow-lg mb-3">
                🧑‍🌾
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                    {profile.isOrganicVerified && <OrganicBadge size="sm" />}
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" /> {profile.village}{profile.location ? `, ${profile.location}` : ''}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                    {profile.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        {profile.rating.toFixed(1)} ({profile.numReviews} reviews)
                      </span>
                    )}
                    {profile.experienceYears > 0 && (
                      <span className="flex items-center gap-1">
                        <Leaf className="h-4 w-4 text-green-500" />
                        {profile.experienceYears} yrs experience
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      Member since {memberYears > 0 ? `${memberYears}yr ago` : 'this year'}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-3xl font-bold text-primary">{profile.products?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">products listed</p>
                </div>
              </div>

              {/* Crops chips */}
              {profile.crops?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {profile.crops.map((c: string) => (
                    <span key={c} className="text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-200 capitalize">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button variant={activeTab === 'products' ? 'default' : 'outline'} onClick={() => setActiveTab('products')}>
            <Package className="h-4 w-4 mr-2" /> Products ({profile.products?.length || 0})
          </Button>
          <Button variant={activeTab === 'about' ? 'default' : 'outline'} onClick={() => setActiveTab('about')}>
            <Leaf className="h-4 w-4 mr-2" /> About Farm
          </Button>
          <Button variant={activeTab === 'updates' ? 'default' : 'outline'} onClick={() => setActiveTab('updates')}>
            <Camera className="h-4 w-4 mr-2" /> Updates ({updates.length})
          </Button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="grid sm:grid-cols-2 gap-4">
            {profile.products?.length === 0 && (
              <p className="text-muted-foreground col-span-2 text-center py-8">No products listed currently.</p>
            )}
            {profile.products?.map((product: any, i: number) => (
              <motion.div key={product._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
                        {CATEGORY_ICONS[product.category] || '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold truncate">{product.name}</p>
                          {profile.isOrganicVerified && <OrganicBadge size="sm" />}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <FreshnessBadge harvestDate={product.harvestDate} category={product.category} showScore />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">{product.category} · {product.unit}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-primary">₹{product.price}</p>
                        <p className="text-xs text-muted-foreground">/{product.unit}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => {
                        addToCart({
                          id: product._id,
                          name: product.name,
                          pricePerUnit: product.price,
                          unit: product.unit,
                          category: product.category,
                          farmerId: profile._id,
                          farmerName: profile.name,
                          farmerVillage: profile.village,
                          images: product.images || [],
                          isOrganic: profile.isOrganicVerified,
                          isAvailable: true,
                          quantityAvailable: product.quantity,
                          harvestDate: product.harvestDate ? new Date(product.harvestDate) : new Date(),
                        } as any);
                        toast({ title: '🛒 Added to cart', description: product.name });
                      }}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardContent className="p-6 space-y-4">
                {profile.isOrganicVerified && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <ShieldCheck className="h-8 w-8 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-800">Verified Organic Farm</p>
                      <p className="text-sm text-emerald-600">Certification documents verified by GramConnect admin.</p>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold mb-2">Farmer's Story</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {profile.story || 'This farmer hasn\'t added their story yet.'}
                  </p>
                </div>
                {profile.crops?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Grows</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.crops.map((c: string) => (
                        <span key={c} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200 capitalize">
                          🌱 {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.pincode && (
                  <p className="text-sm text-muted-foreground">📮 Pincode: {profile.pincode}</p>
                )}
                
                {/* Seasonal Calendar */}
                <div className="pt-4 border-t border-border mt-6">
                  <SeasonalCalendar schedule={schedule} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Updates Tab */}
        {activeTab === 'updates' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {updates.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>This farmer hasn't posted any updates yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {updates.map((update: any) => (
                  <Card key={update._id} className="overflow-hidden">
                    <img src={update.imageUrl} alt="Farm Update" className="w-full aspect-square object-cover" />
                    <CardContent className="p-4">
                      <p className="text-sm">{update.caption}</p>
                      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                        <span>{new Date(update.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">❤️ {update.likes}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default FarmerProfile;
