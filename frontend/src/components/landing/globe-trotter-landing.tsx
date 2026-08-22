"use client";

import { LandingNavbar } from "./landing-navbar";
import { HeroSection } from "./hero-section";
import { TripPreviewSection } from "./trip-preview-section";
import { DestinationsSection } from "./destinations-section";
import { HowItWorksSection } from "./how-it-works-section";
import { FeaturesSection } from "./features-section";
import { RecommendationSection } from "./recommendation-section";
import { CtaSection } from "./cta-section";
import { LandingFooter } from "./landing-footer";

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
