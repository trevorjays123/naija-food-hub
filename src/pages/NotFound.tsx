import { Link } from "react-router-dom";
import { ArrowLeft, Home, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-secondary flex flex-col">
      <div className="container mx-auto px-6 py-6">
        <Logo />
      </div>
      
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-brand-primary/5 flex items-center justify-center">
            <Utensils className="w-12 h-12 text-brand-primary/30" />
          </div>
          
          <h1 className="font-display text-6xl font-bold text-brand-primary mb-4">404</h1>
          <h2 className="font-display text-2xl font-semibold text-brand-primary mb-4">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg" className="bg-brand-accent text-brand-primary hover:bg-brand-accent/90">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Link to="/menu">
              <Button size="lg" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
