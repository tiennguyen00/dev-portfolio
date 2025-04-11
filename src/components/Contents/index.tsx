import AboutSection from "./AboutSection";
import HeroSection from "./HeroSection";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef } from "react";
import { projects } from "../../constants/projects";
import WorkSection from "./WorkSection";
import TechSection from "./TechSection";
import ContactSection from "./ContactSection";

const Contents = ({ scrollRef }: { scrollRef: React.RefObject<number> }) => {
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    // Define all section selectors
    const sectionSelectors = [
      ".herosection",
      ".aboutsection",
      ...projects.map((project) => `.project-section-${project.id}`),
      ".section4",
      ".section5",
    ];

    // Set all sections to opacity 0 initially
    gsap.set(sectionSelectors, { opacity: 0 });
    // Set first section visible initially
    gsap.set(sectionSelectors[0], { opacity: 1 });

    tl.current = gsap.timeline({ paused: true });

    // Calculate the progress step for each section
    const totalSections = sectionSelectors.length;
    const step = 1 / totalSections;

    sectionSelectors.forEach((section, index) => {
      // Calculate section's scroll range
      const sectionStart = index * step;
      const sectionEnd = (index + 1) * step;

      // Each section should be:
      // - Invisible (0) before its range
      // - Fade in (0→1) during the first 15% of its range
      // - Visible (1) for 70% of its range
      // - Fade out (1→0) during the last 15% of its range

      // Set start opacity (only needed for sections after the first)
      if (index > 0) {
        tl.current?.set(section, { opacity: 0 }, sectionStart);

        // Fade in
        tl.current?.to(
          section,
          {
            opacity: 1,
            duration: step * 0.15,
            ease: "power1.in",
          },
          sectionStart
        );
      }

      // Fade out (all sections except the last)
      if (index < totalSections - 1) {
        const fadeOutStart = sectionEnd - step * 0.05;

        tl.current?.to(
          section,
          {
            opacity: 0,
            duration: step * 0.15,
            ease: "power1.out",
          },
          fadeOutStart
        );
      }
    });
  }, []);

  useEffect(() => {
    const updateTimeline = () => {
      if (tl.current) {
        tl.current.progress(scrollRef.current || 0);
      }
      rafId = requestAnimationFrame(updateTimeline);
    };

    let rafId = requestAnimationFrame(updateTimeline);

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
            title={project.title}
            keywords={project.keywords}
            highlights={project.highlights}
            image={project.image}
            demo={project.demo}
            des={project.des}
          />
        </section>
      ))}

      <section className="text-center z-[9999] fixed px-6 w-full h-[100dvh] flex flex-col justify-center items-center section4">
        <TechSection />
      </section>

      <section className="text-center z-[9999] fixed px-6 w-full h-[100dvh] flex flex-col justify-center items-center section5">
        <ContactSection />
      </section>
    </div>
  );
};

export default Contents;
