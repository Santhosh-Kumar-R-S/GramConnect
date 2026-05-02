import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Leaf, ShieldCheck, Heart, Users } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: <Leaf className="h-8 w-8 text-green-600" />,
      title: "Direct from Farm",
      description: "We eliminate middlemen, ensuring farmers get better prices and consumers get fresher produce directly from the source."
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-green-600" />,
      title: "Verified Trust",
      description: "Every farmer is verified, and organic certifications are strictly checked to ensure you get exactly what you pay for."
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Community Driven",
      description: "GramConnect builds strong relationships between local communities and the farmers who feed them."
    },
    {
      icon: <Heart className="h-8 w-8 text-green-600" />,
      title: "Empowering Farmers",
      description: "We provide tools for farmers to manage their sales, negotiate fair prices, and showcase their hard work to the world."
    }
  ];

  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen pb-16">
        {/* Hero Section */}
        <div className="bg-gram-green-700 text-white py-20 px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white">Bridging the Gap Between Farms and Homes</h1>
            <p className="text-lg md:text-xl text-gram-green-50">
              GramConnect is a revolutionary agri-tech platform designed to empower farmers and bring the freshest, most authentic produce directly to your table.
            </p>
          </motion.div>
        </div>

        {/* Mission Section */}
        <div className="container max-w-4xl py-16 px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            For generations, the agricultural supply chain has been fragmented, leaving farmers with minimal profits and consumers with stale, overpriced produce. Our mission is to digitize and democratize this ecosystem. By leveraging technology, we create a transparent, efficient, and trustworthy marketplace where farmers are celebrated and consumers are satisfied.
          </p>
        </div>

        {/* Features Grid */}
        <div className="container max-w-5xl px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-background p-8 rounded-2xl shadow-sm border border-border flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="p-4 bg-green-50 rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="container max-w-3xl text-center py-16 px-4">
          <h2 className="text-3xl font-bold mb-6">Join the Movement</h2>
          <p className="text-muted-foreground mb-8">
            Whether you're a farmer looking to grow your business, or a consumer seeking fresh, organic food, there's a place for you here.
          </p>
        </div>
      </div>
    </Layout>
  );
}
