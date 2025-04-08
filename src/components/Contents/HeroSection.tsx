import { useGSAP } from "@gsap/react";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
gsap.registerPlugin(useGSAP);

const HeroSection = () => {
  const titles = [
    "Frontend Architect & UI Craftsman",
    "3D Visualization Specialist",
    "AI-Powered Development Innovator",
  ];
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const typingSpeed = 50; // milliseconds

  const titleIndexRef = useRef(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const handleTyping = () => {
      const currentTitle = titles[titleIndexRef.current];
      const speed = isDeleting ? typingSpeed / 2 : typingSpeed;

      if (isDeleting) {
        // Deleting characters
        setDisplayText((prev) => prev.substring(0, prev.length - 1));

        // Move to next title when empty
        if (displayText.length === 0) {
          setIsDeleting(false);
          // Update the title index using the ref
          titleIndexRef.current = (titleIndexRef.current + 1) % titles.length;
        }
      } else {
        // Adding characters
        setDisplayText((prev) => {
          const nextCharIndex = prev.length;
          return nextCharIndex < currentTitle.length
            ? currentTitle.substring(0, nextCharIndex + 1)
            : prev;
        });

        // Start deleting after full word is typed
        if (displayText.length === currentTitle.length) {
          timer = setTimeout(() => {
            setIsDeleting(true);
          }, 2000);
          return;
        }
      }

      timer = setTimeout(handleTyping, speed);
    };

    timer = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, typingSpeed]);

  useGSAP(() => {
    gsap.to(".title", {
      opacity: 1,
      duration: 1,
      ease: "power2.inOut",
    });
  }, []);

  return (
    <section className="text-center max-w-2xl px-4 space-y-6 w-full h-[100dvh] flex flex-col justify-center items-center">
      <div className="bg-white bg-opacity-90 text-blue-600 py-2 px-6 rounded-full  inline-block mb-4 shadow-lg font-medium opacity-0 title">
        Hello, World!
      </div>

      <h1 className="text-6xl font-extrabold opacity-0 title">
        I'm <span className="text-yellow-600">Tien</span>
      </h1>

      <div className="text-3xl text-whiteAlpha-800 opacity-0 title">
        <h2
          ref={titleRef}
          className="my-1 font-semibold"
          style={{
            textShadow: "0 0 10px rgba(255,255,255,0.3)",
          }}
        >
          {displayText}
          <span className="animate-pulse">|</span>
        </h2>
      </div>
      <div className="w-full h-[35vh]" />

      <p className="text-lg text-whiteAlpha-700 max-w-3xl w-full font-light opacity-0 title">
        Passionate developer specializing in frontend technologies. Whether you
        are looking to build a commercial website, or create website with a 3D
        experience. <br /> I can help.
      </p>
    </section>
  );
};

export default HeroSection;
