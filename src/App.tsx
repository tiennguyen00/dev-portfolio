import CanvasPage from "./components/Canvas";
// import Contents from "./components/Contents";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useEffect } from "react";
import { lerp } from "three/src/math/MathUtils.js";
gsap.registerPlugin(ScrollTrigger);

function App() {
  const targetScrollProgress = useRef(0);
  const scrollProgress = useRef(0);

  // todo: research about the scrollPorxy in gsap can make it more efficient
  useEffect(() => {
    let rafId = 0;

    const updateScroll = () => {
      scrollProgress.current = lerp(
        scrollProgress.current,
        targetScrollProgress.current,
        0.05
      );

      rafId = requestAnimationFrame(updateScroll);
    };

    rafId = requestAnimationFrame(updateScroll);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: ".scrollcontainer",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        targetScrollProgress.current = self.progress;
      },
    });
  }, []);

  return (
    <div className="w-full min-h-[800dvh] relative scrollcontainer">
      {/* <Contents scrollRef={scrollProgress} /> */}
      <CanvasPage scrollRef={scrollProgress} />
    </div>
  );
}

export default App;
