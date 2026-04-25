import { Link } from "react-router-dom";
import { Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { SEO } from "@/components/SEO";

const NotFound = () => (
  <div className="min-h-screen bg-brand-secondary">
    <SEO title="Page Not Found · Taste Kitchen" />
    <Navbar />
    <div className="container mx-auto px-6 py-24 text-center">
      <Utensils className="w-16 h-16 mx-auto text-brand-accent mb-6" />
      <h1 className="font-display text-6xl font-bold text-brand-primary mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">Looks like this dish isn't on our menu.</p>
      <Link to="/">
        <Button className="bg-brand-accent text-brand-primary hover:bg-brand-accent/90">Back to Home</Button>
      </Link>
    </div>
  </div>
);

export default NotFound;
