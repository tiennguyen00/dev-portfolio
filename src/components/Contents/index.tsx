import AboutSection from "./AboutSection";
import HeroSection from "./HeroSection";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef } from "react";
import { projects } from "../../constants/projects";
import WorkSection from "./WorkSection";
import ContactSection from "./ContactSection";

const Contents = ({ scrollRef }: { scrollRef: React.RefObject<number> }) => {
  const tl = useRef<gsap.core.Timeline | null>(null);

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
      { opacity: 0, display: "none" }
    );

    // Make first section visible initially
    gsap.set(sections[0].selector, {
      opacity: 1,
      display: "flex",
    });

    tl.current = gsap.timeline({
      paused: true,
    });
    tl.current
      .to(sections[0].selector, {
        opacity: 0,
        display: "none",
        duration: 1.5,
        ease: "power4.in",
      })
      // about section
      .to(
        sections[1].selector,
        {
          opacity: 1,
          display: "flex",
          duration: 0.1,
          ease: "power2.out",
        },
        "<95%"
      )
      .to(
        sections[1].selector,
        {
          opacity: 0,
          display: "none",
          ease: "power4.in",
        },
        ">"
      )
      // ghibli landing
      .to(
        sections[2].selector,
        {
          opacity: 1,
          display: "flex",
        },
        "<85%"
      )
      .to(
        sections[2].selector,
        {
          opacity: 0,
          display: "none",
        },
        ">"
      )
      // wolvesville ai
      .to(
        sections[3].selector,
        {
          opacity: 1,
          display: "flex",
        },
        "<75%"
      )
      .to(
        sections[3].selector,
        {
          opacity: 0,
          display: "none",
          duration: 0.1,
          ease: "power2.in",
        },
        ">"
      )
      // ollama assistant
      .to(
        sections[4].selector,
        {
          opacity: 1,
          display: "flex",
          ease: "power4.out",
        },
        "<75%"
      )
      .to(
        sections[4].selector,
        {
          opacity: 0,
          display: "none",
          ease: "power2.in",
        },
        ">"
      )
      // gpgpu particles
      .to(
        sections[5].selector,
        {
          opacity: 1,
          display: "flex",
          ease: "power4.out",
        },
        "<75%"
      )
      .to(
        sections[5].selector,
        {
          opacity: 0,
          display: "none",
          ease: "power2.in",
        },
        ">"
      )
      .to(
        sections[6].selector,
        {
          opacity: 1,
          display: "flex",
        },
        "<75%"
      );
  }, []);

  // Connect timeline to the scroll progress from App.tsx's ScrollTrigger
  useEffect(() => {
    const updateTimeline = () => {
      if (
        tl.current &&
        scrollRef.current !== null &&
        scrollRef.current !== undefined
      ) {
        tl.current.progress(Number(scrollRef.current.toFixed(2)));
      }
      rafId = requestAnimationFrame(updateTimeline);
    };

    // Start the animation loop
    let rafId = requestAnimationFrame(updateTimeline);

    // Cleanup function to prevent memory leaks
    return () => cancelAnimationFrame(rafId);
  }, [scrollRef]);

  return (
    <div className="w-full flex flex-col items-center">
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
