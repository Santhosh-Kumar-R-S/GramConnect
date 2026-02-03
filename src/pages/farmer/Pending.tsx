import { motion } from 'framer-motion';
import { Clock, CheckCircle, Mail, Phone, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const FarmerPending = () => {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
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

        <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
          <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Registration Pending</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for registering as a farmer on GramConnect. Your application is being reviewed by our team.
          </p>

          <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              What happens next?
            </h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">1.</span>
                Our team will verify your details within 24-48 hours
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">2.</span>
                You'll receive an email once approved
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">3.</span>
                Start listing your products and selling!
              </li>
            </ol>
          </div>

          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">Need help? Contact us:</p>
            <div className="flex flex-col gap-2">
              <a href="mailto:support@gramconnect.in" className="inline-flex items-center justify-center gap-2 text-primary hover:underline">
                <Mail className="h-4 w-4" />
                support@gramconnect.in
              </a>
              <a href="tel:+911800123456" className="inline-flex items-center justify-center gap-2 text-primary hover:underline">
                <Phone className="h-4 w-4" />
                +91 1800-123-456
              </a>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <Button variant="outline" asChild className="w-full">
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FarmerPending;
