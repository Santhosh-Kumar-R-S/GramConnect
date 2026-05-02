import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Product } from '@/types';

interface NegotiationModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NegotiationModal({ product, isOpen, onClose }: NegotiationModalProps) {
  const [quantity, setQuantity] = useState<number | ''>('');
  const [requestedPrice, setRequestedPrice] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  if (!product) return null;

  // Assuming product object has minOrderQuantity. If not, default to 1.
  const moq = (product as any).minOrderQuantity || 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Number(quantity) < moq) {
      toast({
        title: "Invalid Quantity",
        description: `Minimum order quantity for this product is ${moq} ${product.unit}.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const response = await fetch('/api/negotiations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: Number(quantity),
          requestedPrice: Number(requestedPrice),
        }),
      });

      if (response.ok) {
        toast({
          title: "Negotiation Started",
          description: "Your offer has been sent to the farmer.",
        });
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to start negotiation.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Negotiate Bulk Order</DialogTitle>
          <DialogDescription>
            Offer a different price for purchasing {product.name} in bulk. The farmer will review your offer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/50 p-3 rounded-lg mb-4 text-sm flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">Original Price</p>
            <p className="font-semibold text-lg">₹{product.pricePerUnit} <span className="text-sm font-normal">/{product.unit}</span></p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Min. Order (MOQ)</p>
            <p className="font-semibold text-lg">{moq} <span className="text-sm font-normal">{product.unit}</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity ({product.unit})</Label>
            <Input
              id="quantity"
              type="number"
              min={moq}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={`Enter quantity (min ${moq})`}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Your Offer Price (₹ per {product.unit})</Label>
            <Input
              id="price"
              type="number"
              min="1"
              max={product.pricePerUnit}
              value={requestedPrice}
              onChange={(e) => setRequestedPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Enter your proposed price"
              required
            />
          </div>

          {quantity && requestedPrice && (
            <div className="py-2 border-t mt-4 flex justify-between items-center text-sm">
              <span className="font-medium text-muted-foreground">Total Offer Value:</span>
              <span className="font-bold text-lg text-primary">₹{(Number(quantity) * Number(requestedPrice)).toLocaleString()}</span>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Submit Offer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
