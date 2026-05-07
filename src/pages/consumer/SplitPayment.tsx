import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function SplitPayment() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const currentUserId = userInfo?.user?.id || userInfo?.user?._id || userInfo?.id || userInfo?._id;

  // Razorpay Script Loader
  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await fetch(`/api/split-payments/${groupId}`);
        if (res.ok) {
          setPaymentData(await res.json());
        } else {
          toast({ title: 'Error', description: 'Split payment not found', variant: 'destructive' });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (groupId) fetchPayment();
  }, [groupId, toast]);

  const handlePayShare = async (contributorId: string, amount: number) => {
    if (!userInfo.token) {
      toast({ title: 'Authentication Required', description: 'Please log in to pay your share.', variant: 'destructive' });
      return;
    }

    try {
      // 1. Create Order
      const orderRes = await fetch(`/api/split-payments/${groupId}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ contributorId })
      });

      if (!orderRes.ok) throw new Error('Failed to initialize payment');
      const rzpOrder = await orderRes.json();

      if (rzpOrder._testMode) {
        toast({ title: 'Notice', description: 'Simulating payment success for demo.' });
        await completePayment(contributorId, `pay_${Date.now()}`, rzpOrder.id, `sig_${Date.now()}`);
        return;
      }

      // 2. Load SDK
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        toast({ title: 'Error', description: 'Razorpay SDK failed to load', variant: 'destructive' });
        return;
      }

      // 3. Open Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SkboVnjJ83LdEp",
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "GramConnect Split Payment",
        description: "Pay your share of the order",
        order_id: rzpOrder.id,
        handler: async function (response: any) {
          await completePayment(contributorId, response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
        },
        prefill: {
          name: userInfo?.user?.name || userInfo?.name,
          email: userInfo?.user?.email || userInfo?.email,
        },
        theme: {
          color: "#16a34a",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to process payment', variant: 'destructive' });
    }
  };

  const completePayment = async (contributorId: string, paymentId: string, orderId: string, signature: string) => {
    try {
      const res = await fetch(`/api/split-payments/${groupId}/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({
          contributorId,
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPaymentData(data.splitPayment);
        toast({ title: 'Success', description: 'Your share has been paid successfully!' });
        
        if (data.splitPayment.status === 'completed') {
          setTimeout(() => {
            navigate('/consumer/orders');
          }, 2000);
        }
      } else {
        const err = await res.json();
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to process payment', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8 max-w-3xl flex justify-center mt-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!paymentData) {
    return (
      <Layout>
        <div className="container py-8 text-center mt-20">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Payment Link Invalid</h2>
          <p className="text-muted-foreground mt-2">This group payment link doesn't exist or has expired.</p>
        </div>
      </Layout>
    );
  }

  const progress = Math.min(100, (paymentData.collectedAmount / paymentData.totalAmount) * 100);

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Group Payment</h1>
            <p className="text-muted-foreground">Initiated by {paymentData.initiatorId?.name}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentData.contributors.map((c: any) => (
                  <div key={c._id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                    <div>
                      <p className="font-semibold">{c.name} {currentUserId === c.userId && '(You)'}</p>
                      <p className="text-sm text-muted-foreground">Share: ₹{c.amountAllocated.toFixed(2)}</p>
                    </div>
                    <div>
                      {c.status === 'paid' ? (
                        <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Paid
                        </div>
                      ) : (
                        currentUserId === c.userId ? (
                          <Button onClick={() => handlePayShare(c._id, c.amountAllocated)}>
                            Pay Share
                          </Button>
                        ) : (
                          <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            Pending
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Collected</span>
                  <span className="font-medium">₹{paymentData.collectedAmount} / ₹{paymentData.totalAmount}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 mb-4 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out"
                  />
                </div>
                {progress === 100 && (
                  <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm text-center border border-green-200">
                    Order Fully Paid & Confirmed!
                  </div>
                )}
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full" onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast({ title: 'Copied!', description: 'Share link copied to clipboard.' });
            }}>
              Copy Share Link
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
