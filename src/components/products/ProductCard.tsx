import { motion } from 'framer-motion';
import { ShoppingCart, MapPin, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { addToCart } = useCart();
  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      vegetables: '🥬',
      fruits: '🍎',
      grains: '🌾',
      pulses: '🫘',
      spices: '🌶️',
      dairy: '🥛',
      other: '📦',
    };
    return emojis[category] || '📦';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative flex flex-col rounded-2xl bg-card border border-border overflow-hidden hover:shadow-card-hover transition-all duration-300"
    >
      {/* Image Placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-gram-green-100 to-gram-green-50 flex items-center justify-center overflow-hidden">
        <span className="text-6xl">{getCategoryEmoji(product.category)}</span>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {product.isOrganic && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              <Leaf className="h-3 w-3" />
              Organic
            </span>
          )}
        </div>

        {/* Quick Add Button */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" className="rounded-full shadow-lg" onClick={() => addToCart(product)}>
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="mb-2">
          <span className="text-xs text-muted-foreground capitalize">{product.category}</span>
        </div>

        <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{product.farmerVillage}</span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <div>
            <span className="text-lg font-bold text-primary">₹{product.pricePerUnit}</span>
            <span className="text-sm text-muted-foreground">/{product.unit}</span>
          </div>
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            product.quantityAvailable > 50
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          )}>
            {product.quantityAvailable} {product.unit} left
          </span>
        </div>
      </div>
    </motion.div>
  );
};
