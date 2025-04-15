import AboutSection from "./AboutSection";
import HeroSection from "./HeroSection";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef } from "react";
import { projects } from "../../constants/projects";
import WorkSection from "./WorkSection";
import ContactSection from "./ContactSection";

// Animation constants
const INITIAL_OPACITY = 0;
const FULL_OPACITY = 1;
const FADE_DURATION = 0.01;

// Define the timing interface
interface SectionTiming {
  start: number; // Point in scroll progress (0-1) where section begins to appear
  end: number; // Point in scroll progress (0-1) where section begins to disappear
}

/**
 * Section timing configuration
 *
 * Each section has:
 * - start: When to begin fading in (0-1 scale)
 * - end: When to begin fading out (0-1 scale)
 *
 * Note: Overlapping ranges (like project-4 and contact) create cross-fade effects
 */
const sectionTimings: Record<string, SectionTiming> = {
  hero: {
    start: 0,
    end: 0.17,
  },
  about: {
    start: 0.17,
    end: 0.27,
  },
  "project-1": {
    start: 0.27,
    end: 0.39,
  },
  "project-2": {
    start: 0.39,
    end: 0.48,
  },
  "project-3": {
    start: 0.48,
    end: 0.58,
  },
  "project-4": {
    start: 0.58,
    end: 0.77,
  },
  contact: {
    start: 0.77,
    end: 0.999, // Use 0.999 instead of 1.0 to avoid GSAP endpoint behavior
  },
};

/**
 * Main content component with scrolling animations
 * Uses the scrollRef from App.tsx (which is updated by ScrollTrigger)
 * to control the visibility of sections based on scroll position
 */
const Contents = ({ scrollRef }: { scrollRef: React.RefObject<number> }) => {
  const tl = useRef<gsap.core.Timeline | null>(null);

  // Initialize GSAP animations
  useGSAP(() => {
    // Map section elements to their timing configuration
    const sections = [
      { selector: ".herosection", timingKey: "hero" },
      { selector: ".aboutsection", timingKey: "about" },
      ...projects.map((project) => ({
        selector: `.project-section-${project.id}`,
        timingKey: `project-${project.id}`,
      })),
      { selector: ".section5", timingKey: "contact" },
    ];

    // Initialize all sections to invisible
    gsap.set(
      sections.map((s) => s.selector),
      { opacity: INITIAL_OPACITY }
    );

    // Make first section visible initially
    gsap.set(sections[0].selector, { opacity: FULL_OPACITY });

    // Create master timeline with clear start/end points
    tl.current = gsap.timeline({ paused: true });

    // Add each section's animations to the timeline in sequence
    sections.forEach((section, index) => {
      const timing = sectionTimings[section.timingKey];
      if (!timing) return;

      const { start, end } = timing;

      // For all sections except the first one
      if (index > 0) {
        // Clear 'to' animation for fade in - will use absolute values
        tl.current?.to(
          section.selector,
          {
            opacity: FULL_OPACITY,
            duration: FADE_DURATION,
            ease: "power1.in",
            immediateRender: false,
          },
          start
        );
      }

      // All sections need proper fade out, even the last one
      // This ensures things disappear at the right time
      if (index < sections.length - 1) {
        // Clear 'to' animation for fade out - will use absolute values
        tl.current?.to(
          section.selector,
          {
            opacity: INITIAL_OPACITY,
            duration: FADE_DURATION,
            ease: "power1.out",
            immediateRender: false,
          },
          end - FADE_DURATION
        );
      }
    });
  }, []);

  // Connect timeline to the scroll progress from App.tsx's ScrollTrigger
  useEffect(() => {
    const updateTimeline = () => {
      if (
        tl.current &&
        scrollRef.current !== null &&
        scrollRef.current !== undefined
      ) {
        // Precision to 2 decimal places and cap at 0.999
        const progress = Math.min(0.999, Number(scrollRef.current.toFixed(2)));

        // Set timeline progress based on current scroll position
        tl.current.progress(progress);
      }
      rafId = requestAnimationFrame(updateTimeline);
    };

    // Start the animation loop
    let rafId = requestAnimationFrame(updateTimeline);

    // Cleanup function to prevent memory leaks
    return () => cancelAnimationFrame(rafId);
  }, [scrollRef]);

  return (
    <div className="w-full flex flex-col items-center pointer-events-none">
      <section className="text-center z-[9999] fixed max-w-2xl px-6 w-full h-[100dvh] flex flex-col justify-center items-center herosection">
        <HeroSection />
      </section>
      <section className="text-center z-[9999] fixed px-6 w-full h-[100dvh] flex flex-col justify-center items-center aboutsection">
        <AboutSection />
      </section>

      {projects.map((project) => (
        <section
          key={project.id}
          className={`text-center z-[9999] fixed px-6 w-full h-[100dvh] flex flex-col justify-center items-center project-section-${project.id}`}
        >
          <WorkSection
            id={project.id}
            title={project.title}
            keywords={project.keywords}
            highlights={project.highlights}
            image={project.image}
            demo={project.demo}
            des={project.des}
          />
        </section>
      ))}

      <section className="text-center z-[9999] fixed px-6 w-full h-[100dvh] flex flex-col justify-center items-center section5">
        <ContactSection />
      </section>
    </div>
  );
};

export default Contents;
