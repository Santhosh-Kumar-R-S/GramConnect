import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, History, ShieldCheck } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (!userInfo.token) return;

        const res = await fetch('/api/wallet', {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance);
          setTransactions(data.transactions);
        } else {
          toast({ title: 'Error', description: 'Failed to fetch wallet details', variant: 'destructive' });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, [toast]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-8 max-w-3xl flex justify-center mt-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">My Wallet</h1>

        {/* Balance Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-gram-green-700 to-gram-green-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <WalletIcon className="h-40 w-40" />
            </div>
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center gap-2 mb-4 text-gram-green-100">
                <ShieldCheck className="h-5 w-5" />
                <span className="font-medium">Secure GramConnect Wallet</span>
              </div>
              <p className="text-gram-green-100 text-sm mb-1">Available Balance</p>
              <h2 className="text-5xl font-bold">₹{balance.toFixed(2)}</h2>
              <p className="mt-4 text-sm text-gram-green-50 max-w-md">
                Earn 3% cashback on bulk orders (50+ kg). Use your wallet balance to pay for future farm-fresh orders!
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transaction History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Transaction History</h3>
          </div>

          <Card>
            <CardContent className="p-0">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No transactions yet. Start shopping to earn cashback!
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <div key={tx._id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {tx.type === 'credit' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-foreground'}`}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
