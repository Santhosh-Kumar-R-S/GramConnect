import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Filter, Leaf, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Fix default marker icons broken by webpack
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const FARM_ICON = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const CATEGORIES = ['All', 'vegetables', 'fruits', 'grains', 'pulses', 'spices', 'dairy'];
const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // India center

function RecenterMap({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(pos, 11); }, [pos, map]);
  return null;
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

const FarmMap = () => {
  const [farms, setFarms] = useState<any[]>([]);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [category, setCategory] = useState('All');
  const [radius, setRadius] = useState(50);
  const [loading, setLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [selectedFarm, setSelectedFarm] = useState<any>(null);

  const fetchFarms = useCallback(async (lat: number, lng: number, cat: string, rad: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(rad) });
      if (cat !== 'All') params.append('category', cat);
      const res = await fetch(`/api/farms/nearby?${params}`);
      if (res.ok) setFarms(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const locate = () => {
    if (!navigator.geolocation) { setLocError('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        setMapCenter(coords);
        fetchFarms(coords[0], coords[1], category, radius);
      },
      () => setLocError('Could not get location. Showing all of India.')
    );
  };

  useEffect(() => { locate(); }, []); // auto-locate on mount

  const handleFilter = () => {
    if (userPos) fetchFarms(userPos[0], userPos[1], category, radius);
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 border-r border-border overflow-y-auto bg-background">
          <div className="p-4 border-b border-border">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Know Your Farm
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Find fresh produce near you</p>
          </div>

          {/* Controls */}
          <div className="p-4 space-y-3 border-b border-border">
            <Button onClick={locate} variant="outline" size="sm" className="w-full gap-2">
              <Navigation className="h-4 w-4" /> Use My Location
            </Button>
            {locError && <p className="text-xs text-red-500">{locError}</p>}

            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors capitalize
                      ${category === c ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Radius: <span className="text-foreground font-semibold">{radius} km</span>
              </label>
              <input
                type="range" min={5} max={200} step={5}
                value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                className="w-full mt-1 accent-primary"
              />
            </div>

            <Button onClick={handleFilter} size="sm" className="w-full gap-2" disabled={!userPos || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
              {loading ? 'Searching...' : 'Search Farms'}
            </Button>
          </div>

          {/* Farm list */}
          <div className="p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground px-1">{farms.length} farm{farms.length !== 1 ? 's' : ''} found</p>
            {farms.map(farm => (
              <motion.div key={farm._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <Card
                  className={`cursor-pointer hover:shadow-md transition-shadow border-2
                    ${selectedFarm?._id === farm._id ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => setSelectedFarm(farm)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{farm.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {farm.village || farm.location || 'Unknown'}
                        </p>
                        {farm.categories?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {farm.categories.slice(0, 3).map((c: string) => (
                              <span key={c} className="text-xs px-1.5 py-0.5 bg-muted rounded-full capitalize">{c}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-2 shrink-0">
                        {userPos && farm.coordinates && (
                          <p className="text-xs text-primary font-medium">
                            {getDistanceKm(userPos[0], userPos[1], farm.coordinates[1], farm.coordinates[0])} km
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">{farm.productCount} products</p>
                      </div>
                    </div>
                    <Link to={`/farmer/${farm._id}`}>
                      <Button size="sm" variant="ghost" className="w-full mt-2 h-7 text-xs text-primary">
                        View Profile <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {!loading && farms.length === 0 && userPos && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Leaf className="h-8 w-8 mx-auto mb-2 opacity-40" />
                No farms found. Try increasing the radius.
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={mapCenter}
            zoom={userPos ? 11 : 5}
            className="h-full w-full z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {userPos && <RecenterMap pos={mapCenter} />}

            {farms.map(farm => (
              farm.coordinates ? (
                <Marker
                  key={farm._id}
                  position={[farm.coordinates[1], farm.coordinates[0]]}
                  icon={FARM_ICON}
                  eventHandlers={{ click: () => setSelectedFarm(farm) }}
                >
                  <Popup>
                    <div className="min-w-[180px]">
                      <p className="font-bold text-sm">{farm.name}</p>
                      <p className="text-xs text-gray-500 mb-2">{farm.village || farm.location}</p>
                      <p className="text-xs mb-1">🛒 {farm.productCount} products</p>
                      {userPos && (
                        <p className="text-xs text-green-700 mb-2">
                          📍 {getDistanceKm(userPos[0], userPos[1], farm.coordinates[1], farm.coordinates[0])} km away
                        </p>
                      )}
                      <Link to={`/farmer/${farm._id}`}>
                        <button className="w-full text-xs bg-green-600 text-white py-1 rounded hover:bg-green-700">
                          View Profile →
                        </button>
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            ))}
          </MapContainer>

          {/* Map overlay hint */}
          {!userPos && !loading && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background/90 backdrop-blur rounded-xl px-4 py-2 shadow text-sm text-center">
              📍 Click "Use My Location" to find farms near you
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FarmMap;
