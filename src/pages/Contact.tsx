import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";

export default function Contact() {
  return (
    <div className="min-h-screen bg-brand-secondary">
      <SEO title="Contact Us · Taste Kitchen" description="Reach Taste Kitchen by phone, email or visit us in Victoria Island, Lagos." />
      <Navbar />

      <section className="bg-brand-primary py-20 px-6 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-secondary mb-4">Get in Touch</h1>
        <p className="text-brand-secondary/80 max-w-2xl mx-auto">We'd love to hear from you. Reach out anytime.</p>
      </section>

      <section className="container mx-auto px-6 py-16 max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><CardContent className="p-6 flex gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-accent/20 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-brand-primary mb-1">Visit Us</h3>
            <p className="text-sm text-muted-foreground">123 Victoria Island<br />Lagos, Nigeria</p>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-6 flex gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-accent/20 flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-brand-primary mb-1">Call Us</h3>
            <a href="tel:+2348001234567" className="text-sm text-muted-foreground hover:text-brand-accent">+234 800 123 4567</a>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-6 flex gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-accent/20 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-brand-primary mb-1">Email</h3>
            <a href="mailto:hello@tastekitchen.ng" className="text-sm text-muted-foreground hover:text-brand-accent">hello@tastekitchen.ng</a>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-6 flex gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-accent/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-brand-primary mb-1">Hours</h3>
            <p className="text-sm text-muted-foreground">Mon–Thu: 10am–10pm<br />Fri–Sat: 10am–11pm<br />Sun: 12pm–9pm</p>
          </div>
        </CardContent></Card>
      </section>
    </div>
  );
}
