"use client";

import { CtaSection } from "./cta-section";
import { DestinationsSection } from "./destinations-section";
import { FeaturesSection } from "./features-section";
import { HeroSection } from "./hero-section";
import { HowItWorksSection } from "./how-it-works-section";
import { LandingFooter } from "./landing-footer";
import { LandingNavbar } from "./landing-navbar";
import { RecommendationSection } from "./recommendation-section";
import { TripPreviewSection } from "./trip-preview-section";

export function GlobeTrotterLanding() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <LandingNavbar />

      <main>
        <HeroSection />
        <TripPreviewSection />
        <DestinationsSection />
        <HowItWorksSection />
        <FeaturesSection />
        <RecommendationSection />
        <CtaSection />
      </main>

      <LandingFooter />
    </div>
  );
}
