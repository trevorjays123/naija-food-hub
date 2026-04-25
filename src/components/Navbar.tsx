import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { supabase } from "@/integrations/supabase/client";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="w-10 h-10 rounded-lg bg-brand-primary flex items-center justify-center border-2 border-brand-accent transition-transform group-hover:scale-105">
        <span className="text-brand-accent font-display text-xl font-bold">TK</span>
      </div>
      <span className="font-display text-xl font-semibold tracking-tight text-brand-primary">
        Taste Kitchen
      </span>
    </Link>
  );
}

export function Navbar() {
  const location = useLocation();
  const { totalItems } = useCart();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        setIsAdmin(roles?.some(r => r.role === 'admin') || false);
      }
    };
    getUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
      if (!session?.user) setIsAdmin(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { href: "/menu", label: "Menu" },
    { href: "/track", label: "Track Order" },
  ];

  if (isAdmin) {
    navLinks.push({ href: "/admin", label: "Admin" });
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-brand-secondary/95 backdrop-blur-sm border-b border-brand-primary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Logo />
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-brand-accent ${
                  location.pathname === link.href ? "text-brand-accent" : "text-brand-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            <Link to="/cart" className="relative p-2 hover:bg-brand-primary/5 rounded-lg transition-colors">
              <ShoppingCart className="h-5 w-5 text-brand-primary" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand-accent text-brand-primary text-xs font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {user ? (
              <Link to="/profile" className="p-2 hover:bg-brand-primary/5 rounded-lg transition-colors">
                <User className="h-5 w-5 text-brand-primary" />
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="outline" className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-brand-secondary">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
          
          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-brand-secondary">
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-medium text-brand-primary hover:text-brand-accent"
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="border-brand-primary/20" />
                <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-lg font-medium text-brand-primary">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({totalItems})
                </Link>
                {user ? (
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-lg font-medium text-brand-primary">
                    <User className="h-5 w-5" />
                    Profile
                  </Link>
                ) : (
                  <Link to="/auth" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-brand-accent text-brand-primary hover:bg-brand-accent/90">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
