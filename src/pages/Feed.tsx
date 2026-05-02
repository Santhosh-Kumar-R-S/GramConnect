import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Search } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Feed() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedUpdates, setLikedUpdates] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const res = await fetch('/api/farm-updates');
      if (res.ok) {
        setUpdates(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: string) => {
    if (likedUpdates.has(id)) return; // Prevent multiple likes in MVP
    try {
      const res = await fetch(`/api/farm-updates/${id}/like`, { method: 'POST' });
      if (res.ok) {
        setLikedUpdates(new Set(likedUpdates).add(id));
        setUpdates(updates.map(u => u._id === id ? { ...u, likes: u.likes + 1 } : u));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen py-8">
        <div className="container max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Farm Feed</h1>
            <p className="text-muted-foreground">See what's happening at your local farms today.</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground animate-pulse">Loading updates...</div>
          ) : updates.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <p>No farm updates found. Check back later!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {updates.map((update, idx) => (
                <motion.div
                  key={update._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="p-4 flex flex-row items-center gap-3 space-y-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xl shrink-0">
                        👨‍🌾
                      </div>
                      <div className="flex-1">
                        <Link to={`/farmer/${update.farmer._id}`} className="font-semibold hover:underline">
                          {update.farmer.name}
                        </Link>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {update.farmer.village}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(update.createdAt).toLocaleDateString()}
                      </span>
                    </CardHeader>
                    
                    <img 
                      src={update.imageUrl} 
                      alt="Farm Update" 
                      className="w-full aspect-[4/3] object-cover bg-muted" 
                    />
                    
                    <CardContent className="p-4 pb-2">
                      <p className="text-sm">{update.caption}</p>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <button 
                        onClick={() => handleLike(update._id)}
                        className={cn(
                          "flex items-center gap-2 text-sm font-medium transition-colors",
                          likedUpdates.has(update._id) ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                        )}
                      >
                        <Heart className={cn("h-5 w-5", likedUpdates.has(update._id) && "fill-current")} />
                        {update.likes} {update.likes === 1 ? 'like' : 'likes'}
                      </button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
