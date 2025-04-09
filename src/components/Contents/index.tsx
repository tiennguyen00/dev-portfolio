import AboutSection from "./AboutSection";
import HeroSection from "./HeroSection";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef } from "react";

const Contents = ({ scrollRef }: { scrollRef: React.RefObject<number> }) => {
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    gsap.set(".section2", { opacity: 0 });

    gsap.fromTo(
      ".section1",
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1,
        ease: "power2.inOut",
      }
    );

    tl.current = gsap.timeline({ paused: true });

    tl.current
      .fromTo(
        ".section1",
        { opacity: 1 },
        {
          opacity: 0,
          duration: 1,
          ease: "power2.inOut",
        },
        0 // Start at position 0
      )
      .fromTo(
        ".section2",
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: "power2.inOut",
        },
        0 // Start at position 0 (same time as the section1 animation)
      );
  }, []);

  useEffect(() => {
    const updateTimeline = () => {
      if (tl.current) {
        const progress = Math.min(1, (scrollRef.current || 0) / 0.2);
        tl.current.progress(progress);
      }
      rafId = requestAnimationFrame(updateTimeline);
    };

    let rafId = requestAnimationFrame(updateTimeline);

    return () => cancelAnimationFrame(rafId);
  }, [scrollRef]);

  return (
    <div className="w-full flex flex-col items-center pointer-events-none">
      <section className="text-center z-[9999] fixed max-w-2xl px-6 w-full h-[100dvh] flex flex-col justify-center items-center section1">
        <HeroSection />
      </section>
      <section className="text-center z-[9999] fixed px-6 w-full h-[100dvh] flex flex-col justify-center items-center section2">
        <AboutSection />
      </section>
    </div>
  );
};

export default Contents;
