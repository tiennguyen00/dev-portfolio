import AboutSection from "./AboutSection";
import HeroSection from "./HeroSection";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "section1", component: HeroSection, start: 0, end: 0.2 },
  { id: "section2", component: AboutSection, start: 0.2, end: 0.4 },
  // { id: "section3", component: ProjectsSection, start: 0.4, end: 0.6 },
  // { id: "section4", component: SkillsSection, start: 0.6, end: 0.8 },
  // { id: "section5", component: ContactSection, start: 0.8, end: 1.0 },
];

const Contents = ({ scrollRef }: { scrollRef: React.RefObject<number> }) => {
  const [activeSection, setActiveSection] = useState(0);
  const sectionTimelines = useRef<(gsap.core.Timeline | null)[]>(
    Array(SECTIONS.length).fill(null)
  );
  const prevScrollPosition = useRef(0);

  SECTIONS.forEach((section, index) => {
    if (index === 0) {
      gsap.set(`.${section.id}`, { opacity: 1, display: "flex" });
    } else {
      gsap.set(`.${section.id}`, { opacity: 0, display: "none" });
    }
  });

  // Create timelines for transitions between sections
  useGSAP(() => {
    SECTIONS.forEach((section, index) => {
      if (index < SECTIONS.length - 1) {
        const nextSection = SECTIONS[index + 1];
        const tl = gsap.timeline({ paused: true });

        // Forward animation: current section fades out, next section fades in
        tl.to(`.${section.id}`, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => {
            if (tl.progress() === 1) {
              // Only run if animation completes forward
              gsap.set(`.${section.id}`, { display: "none" });
              gsap.set(`.${nextSection.id}`, { display: "flex", opacity: 0 });
            }
          },
        }).to(`.${nextSection.id}`, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut",
        });

        // Add reverse callbacks to handle display property when scrolling backward
        tl.eventCallback("onReverseComplete", () => {
          gsap.set(`.${nextSection.id}`, { display: "none" });
          gsap.set(`.${section.id}`, { display: "flex", opacity: 1 });
        });

        sectionTimelines.current[index] = tl;
      }
    });
  }, []);

  // Update timelines based on scroll position
  useEffect(() => {
    const updateTimelines = () => {
      const currentProgress = scrollRef.current || 0;
      const isScrollingDown = currentProgress > prevScrollPosition.current;

      // Update previous scroll position for next frame
      prevScrollPosition.current = currentProgress;

      // Find which section we're in
      const currentSectionIndex = SECTIONS.findIndex(
        (section, index) =>
          currentProgress >= section.start &&
          currentProgress < (SECTIONS[index + 1]?.start || 1)
      );

      if (currentSectionIndex !== -1) {
        // Only update if section changed
        if (currentSectionIndex !== activeSection) {
          // Going forward
          if (currentSectionIndex > activeSection) {
            for (let i = activeSection; i < currentSectionIndex; i++) {
              if (sectionTimelines.current[i]) {
                sectionTimelines.current[i]?.progress(1);
              }
            }
          }
          // Going backward
          else {
            for (let i = activeSection - 1; i >= currentSectionIndex; i--) {
              if (sectionTimelines.current[i]) {
                sectionTimelines.current[i]?.reverse();
              }
            }
          }
          setActiveSection(currentSectionIndex);
        }

        // Handle transition animations at section boundaries
        const currentSection = SECTIONS[currentSectionIndex];
        const nextSection = SECTIONS[currentSectionIndex + 1];

        if (nextSection && currentProgress >= currentSection.end) {
          // Calculate progress within the transition zone
          const transitionProgress =
            (currentProgress - currentSection.end) /
            (nextSection.start - currentSection.end);

          // Use seek for smoother transitions in both directions
          const tl = sectionTimelines.current[currentSectionIndex];
          if (tl) {
            if (isScrollingDown) {
              // Going forward - ensure we're playing forward
              if (tl.reversed()) tl.play();
              tl.progress(transitionProgress);
            } else {
              // Going backward - ensure we're playing in reverse
              const reverseProgress = 1 - transitionProgress;
              tl.progress(reverseProgress);
            }
          }
        }
      }

      rafId = requestAnimationFrame(updateTimelines);
    };

    let rafId = requestAnimationFrame(updateTimelines);
    return () => cancelAnimationFrame(rafId);
  }, [scrollRef, activeSection]);

  return (
    <div className="w-full z-[9999] fixed flex flex-col items-center pointer-events-none">
      {SECTIONS.map((section) => (
        <section
          key={section.id}
          className={`text-center px-6 w-full h-[100dvh] flex flex-col justify-center items-center ${section.id} opacity-0`}
        >
          <section.component />
        </section>
      ))}
    </div>
  );
};

export default Contents;
