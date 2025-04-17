import CanvasPage from "./components/Canvas";
import Contents from "./components/Contents";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { lerp } from "three/src/math/MathUtils.js";
import MobileUI from "./components/MobileUI";
gsap.registerPlugin(ScrollTrigger);

function App() {
  const targetScrollProgress = useRef(0);
  const scrollProgress = useRef(0);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const isMobile = useMediaQuery({ query: "(max-width: 560px)" });

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

  if (isMobile) {
    return <MobileUI scrollProgress={scrollProgress} />;
  }

  return (
    <div className="w-full min-h-[1000dvh] relative scrollcontainer">
      {loadingAssets && <Contents scrollRef={scrollProgress} />}
      <CanvasPage
        scrollRef={scrollProgress}
        setLoadingAssets={setLoadingAssets}
      />
    </div>
  );
}

export default App;
