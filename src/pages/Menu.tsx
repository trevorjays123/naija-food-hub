import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Minus, ShoppingBag, Search, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Navbar } from "@/components/Navbar";
import { SEO } from "@/components/SEO";
import { useCart } from "@/hooks/use-cart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'nigerian' | 'continental' | 'fastfood';
  image_url: string | null;
  available: boolean;
}

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const { addItem, items: cartItems, updateQuantity } = useCart();
  const { toast } = useToast();

  const activeCategory = searchParams.get("category") || "all";

  useEffect(() => {
    const itemId = searchParams.get("item");
    if (itemId && items.length) {
      const found = items.find((i) => i.id === itemId);
      if (found) setSelectedItem(found);
    }
  }, [searchParams, items]);

  useEffect(() => {
    const fetchMenu = async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('category');
      
      if (error) {
        console.error('Error fetching menu:', error);
      } else {
        setItems(data || []);
      }
      setLoading(false);
    };
    fetchMenu();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCartQuantity = (itemId: string) => {
    const cartItem = cartItems.find((item) => item.id === itemId);
    return cartItem?.quantity || 0;
  };

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image_url,
    });
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const categories = [
    { value: "all", label: "All" },
    { value: "nigerian", label: "Nigerian" },
    { value: "continental", label: "Continental" },
    { value: "fastfood", label: "Fast Food" },
  ];

  return (
    <div className="min-h-screen bg-brand-secondary">
      <SEO title="Menu · Taste Kitchen" description="Browse our Nigerian, continental and fast food menu. Order online with fast Lagos delivery." />
      <Navbar />
      
      {/* Header */}
      <div className="bg-brand-primary py-16 px-6">
        <div className="container mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-secondary mb-4">
            Our Menu
          </h1>
          <p className="text-brand-secondary/70 max-w-2xl mx-auto">
            Explore our carefully curated selection of Nigerian classics, continental favorites, and quick bites.
          </p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="sticky top-16 z-40 bg-brand-secondary/95 backdrop-blur-sm border-b border-brand-primary/10 py-4 px-6">
        <div className="container mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Tabs value={activeCategory} onValueChange={(v) => setSearchParams(v === "all" ? {} : { category: v })}>
            <TabsList className="bg-brand-primary/5">
              {categories.map((cat) => (
                <TabsTrigger 
                  key={cat.value} 
                  value={cat.value}
                  className="data-[state=active]:bg-brand-primary data-[state=active]:text-brand-secondary"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-brand-primary/20"
            />
          </div>
        </div>
      </div>
      
      {/* Menu Grid */}
      <div className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-square bg-brand-primary/10" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-brand-primary/10 rounded w-3/4" />
                  <div className="h-4 bg-brand-primary/10 rounded w-full" />
                  <div className="h-6 bg-brand-primary/10 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto text-brand-primary/20 mb-4" />
            <h3 className="font-display text-2xl font-bold text-brand-primary mb-2">No items found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const qty = getCartQuantity(item.id);
              return (
                <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-square bg-brand-primary/5 relative overflow-hidden">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-primary/20">
                        <Utensils className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-brand-accent/90 text-brand-primary text-xs font-semibold rounded-full capitalize">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-semibold text-brand-primary mb-1">{item.name}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-brand-accent font-bold text-lg">₦{item.price.toLocaleString()}</span>
                      {qty > 0 ? (
                        <div className="flex items-center gap-2">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, qty - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{qty}</span>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, qty + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          className="bg-brand-primary text-brand-secondary hover:bg-brand-primary/90"
                          onClick={() => handleAddToCart(item)}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
