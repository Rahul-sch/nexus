"use client";

import { Navbar, Hero, Features, Workflow, Demo, CTA, Footer } from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <Hero />
      <div id="features">
        <Features />
      </div>
      <div id="workflow">
        <Workflow />
      </div>
      <div id="demo">
        <Demo />
      </div>
      <CTA />
      <Footer />
    </div>
  );
}
