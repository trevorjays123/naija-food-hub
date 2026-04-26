import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, MapPin, Phone, Star, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import heroFood from "@/assets/hero-food.jpg";
import catNigerian from "@/assets/cat-nigerian.jpg";
import catContinental from "@/assets/cat-continental.jpg";
import catFastfood from "@/assets/cat-fastfood.jpg";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
}

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .limit(4);
      if (data) setFeaturedItems(data);
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-brand-secondary">
      <SEO title="Taste Kitchen — Nigerian, Continental & Fast Food in Lagos" description="Order authentic Nigerian, continental and fast food online. Fast Lagos delivery, secure payments, live order tracking." canonical="/" />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroFood} 
            alt="Delicious Nigerian cuisine" 
            className="w-full h-full object-cover brightness-[0.65]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/80 via-brand-primary/50 to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-brand-accent fill-brand-accent" />
              <span className="text-brand-secondary/90 font-medium">Lagos' Finest Since 2018</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-brand-secondary leading-[1.1] mb-6">
              Satisfying Your <span className="text-brand-accent">Taste Buds</span>
            </h1>
            
            <p className="text-lg md:text-xl text-brand-secondary/80 mb-8 max-w-lg leading-relaxed">
              Experience authentic Nigerian flavors, expertly crafted continental dishes, and satisfying fast food — all made with the freshest ingredients.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/menu">
                <Button size="lg" className="bg-brand-accent text-brand-primary hover:bg-brand-accent/90 font-semibold text-lg px-8">
                  Order Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/menu">
                <Button size="lg" variant="outline" className="bg-brand-secondary/10 backdrop-blur-sm border-2 border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-brand-primary font-semibold text-lg px-8">
                  View Menu
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-brand-secondary/20">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-accent" />
                <span className="text-brand-secondary/80 text-sm">30-45 min delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-accent" />
                <span className="text-brand-secondary/80 text-sm">Lagos & environs</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-brand-accent" />
                <span className="text-brand-secondary/80 text-sm">+234 800 123 4567</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Menu Categories */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="text-brand-accent font-semibold uppercase tracking-wider text-sm">Our Menu</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-primary mt-3">
              Discover Your Next Favorite Dish
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Nigerian */}
            <Link to="/menu?category=nigerian" className="group relative overflow-hidden rounded-2xl aspect-[3/4]">
              <img 
                src={catNigerian} 
                alt="Nigerian Cuisine" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 via-brand-primary/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Utensils className="w-5 h-5 text-brand-accent" />
                  <span className="text-brand-secondary/80 text-sm">Traditional</span>
                </div>
                <h3 className="font-display text-3xl font-bold text-brand-secondary mb-2">Nigerian</h3>
                <p className="text-brand-secondary/80 text-sm mb-4">Rich, spicy, and full of flavor. Taste the true heart of West Africa.</p>
                <span className="inline-flex items-center text-brand-accent font-semibold text-sm group-hover:gap-2 transition-all">
                  Explore Menu <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </Link>
            
            {/* Continental */}
            <Link to="/menu?category=continental" className="group relative overflow-hidden rounded-2xl aspect-[3/4]">
              <img 
                src={catContinental} 
                alt="Continental Cuisine" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 via-brand-primary/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-brand-accent" />
                  <span className="text-brand-secondary/80 text-sm">Premium</span>
                </div>
                <h3 className="font-display text-3xl font-bold text-brand-secondary mb-2">Continental</h3>
                <p className="text-brand-secondary/80 text-sm mb-4">Elegant dishes from around the globe, prepared with finesse.</p>
                <span className="inline-flex items-center text-brand-accent font-semibold text-sm group-hover:gap-2 transition-all">
                  Explore Menu <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </Link>
            
            {/* Fast Food */}
            <Link to="/menu?category=fastfood" className="group relative overflow-hidden rounded-2xl aspect-[3/4]">
              <img 
                src={catFastfood} 
                alt="Fast Food" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 via-brand-primary/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-brand-accent" />
                  <span className="text-brand-secondary/80 text-sm">Quick</span>
                </div>
                <h3 className="font-display text-3xl font-bold text-brand-secondary mb-2">Fast Food</h3>
                <p className="text-brand-secondary/80 text-sm mb-4">Quick, delicious, and satisfying. Perfect for a quick bite.</p>
                <span className="inline-flex items-center text-brand-accent font-semibold text-sm group-hover:gap-2 transition-all">
                  Explore Menu <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <section className="py-24 px-6 bg-brand-primary">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <span className="text-brand-accent font-semibold uppercase tracking-wider text-sm">Chef's Picks</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-secondary mt-3">
                Featured Dishes
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item) => (
                <Link 
                  key={item.id} 
                  to={`/menu?item=${item.id}`}
                  className="group bg-brand-secondary rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-square bg-brand-primary/10 relative overflow-hidden">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-primary/30">
                        <Utensils className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-semibold text-brand-primary mb-1">{item.name}</h3>
                    <p className="text-brand-accent font-bold">₦{item.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Footer */}
      <footer className="bg-brand-primary text-brand-secondary py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-brand-accent flex items-center justify-center">
                  <span className="text-brand-primary font-display text-xl font-bold">TK</span>
                </div>
                <span className="font-display text-xl font-semibold">Taste Kitchen</span>
              </div>
              <p className="text-brand-secondary/70 text-sm leading-relaxed">
                Bringing the finest Nigerian, Continental, and Fast Food cuisine to Lagos since 2018.
              </p>
            </div>
            
            <div>
              <h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-brand-secondary/70">
                <li><Link to="/menu" className="hover:text-brand-accent transition-colors">Our Menu</Link></li>
                <li><Link to="/track" className="hover:text-brand-accent transition-colors">Track Order</Link></li>
                <li><Link to="/about" className="hover:text-brand-accent transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-brand-accent transition-colors">Contact</Link></li>
                <li><Link to="/auth" className="hover:text-brand-accent transition-colors">My Account</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-display text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-brand-secondary/70">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-brand-accent" />
                  <span>123 Victoria Island, Lagos, Nigeria</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-accent" />
                  <span>+234 800 123 4567</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-display text-lg font-semibold mb-4">Hours</h4>
              <ul className="space-y-2 text-sm text-brand-secondary/70">
                <li className="flex justify-between">
                  <span>Mon - Thu</span>
                  <span>10am - 10pm</span>
                </li>
                <li className="flex justify-between">
                  <span>Fri - Sat</span>
                  <span>10am - 11pm</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday</span>
                  <span>12pm - 9pm</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-brand-secondary/20 mt-12 pt-8 text-center text-sm text-brand-secondary/50">
            <p>&copy; {new Date().getFullYear()} Taste Kitchen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
