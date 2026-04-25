import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Package, Clock, CheckCircle, Truck, XCircle, Loader2, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/Navbar";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_status: string;
  delivery_status: string;
  paystack_reference: string | null;
  created_at: string;
  order_items: {
    item_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-5 h-5 text-amber-500" />,
  confirmed: <CheckCircle className="w-5 h-5 text-blue-500" />,
  preparing: <Package className="w-5 h-5 text-purple-500" />,
  out_for_delivery: <Truck className="w-5 h-5 text-orange-500" />,
  delivered: <CheckCircle className="w-5 h-5 text-green-500" />,
  cancelled: <XCircle className="w-5 h-5 text-red-500" />,
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get("id") || "";
  const [searchQuery, setSearchQuery] = useState(initialId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  const lookup = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`*, order_items (item_name, quantity, unit_price)`)
      .or(`id.eq.${q},paystack_reference.eq.${q}`)
      .maybeSingle();
    if (error || !data) {
      toast({ title: "Order not found", description: "Please check your order ID and try again.", variant: "destructive" });
      setOrder(null);
    } else {
      setOrder(data as Order);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    lookup(searchQuery);
  };

  useEffect(() => {
    if (initialId) lookup(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  useEffect(() => {
    if (!order?.id) return;
    const channel = supabase
      .channel(`track-${order.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` },
        (payload) => setOrder((prev) => prev ? { ...prev, ...(payload.new as any) } : prev)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [order?.id]);

  return (
    <div className="min-h-screen bg-brand-secondary">
      <SEO title="Track Order · Taste Kitchen" description="Track your Taste Kitchen delivery in real time." />
      <Navbar />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-4xl font-bold text-brand-primary text-center mb-4">
            Track Your Order
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Enter your order ID or payment reference to check your delivery status.
          </p>
          
          <form onSubmit={handleSearch} className="flex gap-3 mb-12">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Enter order ID or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button 
              type="submit" 
              className="h-12 px-8 bg-brand-accent text-brand-primary hover:bg-brand-accent/90"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track"}
            </Button>
          </form>
          
          {order && (
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="flex items-center gap-2">
                      {statusIcons[order.delivery_status]}
                      <span className="font-semibold">{statusLabels[order.delivery_status]}</span>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Order Placed</span>
                    <span>Preparing</span>
                    <span>Out for Delivery</span>
                    <span>Delivered</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-accent transition-all duration-500"
                      style={{
                        width: order.delivery_status === 'pending' ? '12%' :
                               order.delivery_status === 'confirmed' ? '25%' :
                               order.delivery_status === 'preparing' ? '50%' :
                               order.delivery_status === 'out_for_delivery' ? '75%' :
                               order.delivery_status === 'delivered' ? '100%' : '0%'
                      }}
                    />
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                {/* Order Items */}
                <div className="space-y-3 mb-6">
                  <h3 className="font-semibold">Order Items</h3>
                  {order.order_items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.item_name}
                      </span>
                      <span>₦{(item.unit_price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₦{order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{order.delivery_fee === 0 ? "FREE" : `₦${order.delivery_fee.toLocaleString()}`}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-brand-accent">₦{order.total.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Delivery Info */}
                <div className="mt-8 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Delivery Address
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {order.delivery_address}<br />
                    {order.delivery_city}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {order.customer_phone}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {searched && !order && !loading && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-brand-primary/20 mb-4" />
              <h3 className="font-display text-xl font-semibold text-brand-primary mb-2">Order not found</h3>
              <p className="text-muted-foreground">Double-check your order ID and try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
