import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, MapPin, Phone, ShoppingBag, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/Navbar";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isValidNigerianPhone, normalizeNigerianPhone } from "@/lib/validators";
import { SEO } from "@/components/SEO";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "Lagos",
    notes: "",
  });

  const deliveryFee = subtotal > 10000 ? 0 : 1500;
  const total = subtotal + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidNigerianPhone(formData.phone)) {
      toast({
        title: "Invalid phone number",
        description: "Enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          customer_name: formData.fullName,
          customer_phone: normalizeNigerianPhone(formData.phone),
          customer_email: formData.email,
          delivery_address: formData.address,
          delivery_city: formData.city,
          delivery_notes: formData.notes,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          payment_status: 'pending',
          delivery_status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        item_name: item.name,
        unit_price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Initialize Paystack payment
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('paystack-initiate', {
        body: {
          email: formData.email,
          amount: total * 100, // Paystack expects amount in kobo
          order_id: order.id,
          metadata: {
            order_id: order.id,
            customer_name: formData.fullName,
          },
        },
      });

      if (paymentError || !paymentData?.authorization_url) {
        throw new Error('Failed to initialize payment');
      }

      // Clear cart and redirect to Paystack
      clearCart();
      window.location.href = paymentData.authorization_url;

    } catch (error: any) {
      toast({
        title: "Checkout failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-secondary">
        <Navbar />
        <div className="container mx-auto px-6 py-24 text-center">
          <ShoppingBag className="w-20 h-20 mx-auto text-brand-primary/20 mb-6" />
          <h1 className="font-display text-3xl font-bold text-brand-primary mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add some delicious items to get started.</p>
          <Link to="/menu">
            <Button size="lg" className="bg-brand-accent text-brand-primary hover:bg-brand-accent/90">
              Browse Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-secondary">
      <SEO title="Checkout · Taste Kitchen" description="Complete your order securely with Paystack." />
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        <Link to="/cart" className="inline-flex items-center text-muted-foreground hover:text-brand-primary mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Link>
        
        <h1 className="font-display text-3xl font-bold text-brand-primary mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-brand-accent" />
                    </div>
                    <h2 className="font-display text-xl font-semibold">Contact Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+234 800 123 4567"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Delivery Address */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-brand-accent" />
                    </div>
                    <h2 className="font-display text-xl font-semibold">Delivery Address</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        placeholder="123 Victoria Island Road"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        placeholder="Lagos"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                      <Input
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Ring the bell twice, call when you arrive..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Payment */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-brand-accent" />
                    </div>
                    <h2 className="font-display text-xl font-semibold">Payment</h2>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    You'll be redirected to Paystack to complete your payment securely.
                  </p>
                </CardContent>
              </Card>
              
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-brand-accent text-brand-primary hover:bg-brand-accent/90 font-semibold text-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay ₦{total.toLocaleString()}</>
                )}
              </Button>
            </form>
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-bold text-brand-primary mb-6">Order Summary</h2>
                
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-brand-primary/5 rounded-lg flex-shrink-0 flex items-center justify-center">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-brand-primary/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-brand-primary truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-brand-accent">₦{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{deliveryFee === 0 ? "FREE" : `₦${deliveryFee.toLocaleString()}`}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span className="text-brand-accent">₦{total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
