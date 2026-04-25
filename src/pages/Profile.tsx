import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Package, Loader2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile { full_name: string | null; phone: string | null }
interface Order {
  id: string;
  total: number;
  payment_status: string;
  delivery_status: string;
  created_at: string;
  order_items: { item_name: string; quantity: number }[];
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      const [{ data: prof }, { data: ord }] = await Promise.all([
        supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
        supabase
          .from("orders")
          .select("id, total, payment_status, delivery_status, created_at, order_items(item_name, quantity)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      setProfile(prof as Profile | null);
      setOrders((ord as Order[]) || []);
      setLoading(false);
    };
    load();
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-brand-secondary">
      <SEO title="My Account · Taste Kitchen" description="View your profile and order history." />
      <Navbar />

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-accent" /></div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-brand-primary flex items-center justify-center">
                  <UserIcon className="w-7 h-7 text-brand-accent" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-brand-primary">{profile?.full_name || "Welcome"}</h1>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  {profile?.phone && <p className="text-sm text-muted-foreground">{profile.phone}</p>}
                </div>
              </div>
              <Button variant="outline" onClick={signOut}><LogOut className="w-4 h-4 mr-2" />Sign Out</Button>
            </div>

            <h2 className="font-display text-xl font-semibold text-brand-primary mb-4">Order History</h2>

            {orders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                  <Link to="/menu"><Button className="bg-brand-accent text-brand-primary hover:bg-brand-accent/90">Browse Menu</Button></Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <Link key={o.id} to={`/order/${o.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-sm font-medium truncate">
                            {o.order_items.map((i) => `${i.quantity}× ${i.item_name}`).join(", ")}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(o.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-brand-accent">₦{o.total.toLocaleString()}</p>
                          <p className="text-xs capitalize text-muted-foreground">{o.delivery_status.replace(/_/g, " ")}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
