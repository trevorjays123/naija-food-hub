import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle, Clock, Loader2, MapPin, Package, Phone, Truck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/Navbar";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

interface OrderRow {
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
  created_at: string;
  order_items: { item_name: string; quantity: number; unit_price: number }[];
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-5 h-5 text-amber-500" />,
  confirmed: <CheckCircle className="w-5 h-5 text-blue-500" />,
  preparing: <Package className="w-5 h-5 text-purple-500" />,
  out_for_delivery: <Truck className="w-5 h-5 text-orange-500" />,
  delivered: <CheckCircle className="w-5 h-5 text-green-500" />,
  cancelled: <XCircle className="w-5 h-5 text-red-500" />,
};

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;

    const fetchOrder = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(item_name, quantity, unit_price)")
        .eq("id", id)
        .maybeSingle();
      if (active) {
        setOrder(data as OrderRow | null);
        setLoading(false);
      }
    };
    fetchOrder();

    const channel = supabase
      .channel(`order-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
        (payload) => {
          setOrder((prev) => (prev ? { ...prev, ...(payload.new as any) } : prev));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-brand-secondary">
      <SEO title="Order Confirmed · Taste Kitchen" description="Your order has been placed successfully." />
      <Navbar />

      <div className="container mx-auto px-6 py-12 max-w-2xl">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
          </div>
        ) : !order ? (
          <Card>
            <CardContent className="p-12 text-center">
              <XCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h1 className="font-display text-2xl font-bold mb-2">Order not found</h1>
              <p className="text-muted-foreground mb-6">We couldn't locate that order.</p>
              <Link to="/menu">
                <Button>Browse Menu</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-primary mb-2">
                Thank you, {order.customer_name.split(" ")[0]}!
              </h1>
              <p className="text-muted-foreground">
                Your order has been placed. We'll start preparing it shortly.
              </p>
              <p className="font-mono text-sm mt-3 text-brand-primary">
                Order ID: <span className="font-bold">{order.id.slice(0, 8).toUpperCase()}</span>
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment</span>
                  <span className={`text-sm font-semibold capitalize ${order.payment_status === "paid" ? "text-green-600" : "text-amber-600"}`}>
                    {order.payment_status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {statusIcons[order.delivery_status]}
                    <span className="capitalize">{order.delivery_status.replace(/_/g, " ")}</span>
                  </span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Items</h3>
                  {order.order_items?.map((it, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{it.quantity}× {it.item_name}</span>
                      <span>₦{(it.unit_price * it.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₦{order.subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{order.delivery_fee === 0 ? "FREE" : `₦${order.delivery_fee.toLocaleString()}`}</span></div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t mt-2"><span>Total</span><span className="text-brand-accent">₦{order.total.toLocaleString()}</span></div>
                </div>

                <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                  <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-brand-accent" /><span>{order.delivery_address}, {order.delivery_city}</span></div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-accent" /><span>{order.customer_phone}</span></div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 mt-6">
              <Link to={`/track?id=${order.id}`} className="flex-1">
                <Button variant="outline" className="w-full">Track Order</Button>
              </Link>
              <Link to="/menu" className="flex-1">
                <Button className="w-full bg-brand-accent text-brand-primary hover:bg-brand-accent/90">Order Again</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
