import { Award, Heart, Leaf, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SEO } from "@/components/SEO";

export default function About() {
  const values = [
    { icon: Heart, title: "Made with Love", desc: "Every dish is prepared with care by our master chefs." },
    { icon: Leaf, title: "Fresh Ingredients", desc: "We source the finest local produce daily." },
    { icon: Award, title: "Award Winning", desc: "Recognized as one of Lagos' top restaurants since 2018." },
    { icon: Users, title: "Family First", desc: "We treat every customer like family." },
  ];

  return (
    <div className="min-h-screen bg-brand-secondary">
      <SEO title="About Us · Taste Kitchen" description="Learn the story behind Taste Kitchen — Lagos' finest Nigerian, continental and fast food restaurant." />
      <Navbar />

      <section className="bg-brand-primary py-20 px-6 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-secondary mb-4">Our Story</h1>
        <p className="text-brand-secondary/80 max-w-2xl mx-auto">
          Born in Lagos in 2018, Taste Kitchen brings together the soul of Nigerian cooking with global culinary craft.
        </p>
      </section>

      <section className="container mx-auto px-6 py-16 max-w-3xl">
        <p className="text-lg text-brand-primary/80 leading-relaxed mb-6">
          What started as a small kitchen on Victoria Island has grown into one of Lagos' most loved
          dining destinations. We believe great food brings people together — whether it's a steaming
          plate of jollof, a perfectly grilled steak, or a late-night shawarma.
        </p>
        <p className="text-lg text-brand-primary/80 leading-relaxed">
          Our team of chefs trained in Lagos, Lyon and London work together to create menus that honor
          tradition while exploring something new every day.
        </p>
      </section>

      <section className="bg-brand-primary/5 py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-display text-3xl font-bold text-brand-primary text-center mb-12">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-brand-accent/20 flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-brand-accent" />
                </div>
                <h3 className="font-display font-semibold text-brand-primary mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
