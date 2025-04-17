import { useRef } from "react";
import Contents from "./Contents";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const MobileUI = ({
  scrollProgress,
}: {
  scrollProgress: React.RefObject<number>;
}) => {
  const indicatorRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!indicatorRef.current) return;

    // Create a GSAP ticker that updates the indicator height directly
    const updateIndicator = () => {
      if (indicatorRef.current && scrollProgress.current !== undefined) {
        indicatorRef.current.style.height = `${scrollProgress.current * 100}%`;
      }
    };

    gsap.ticker.add(updateIndicator);

    return () => {
      gsap.ticker.remove(updateIndicator);
    };
  }, []);

  return (
    <div className="w-full min-h-[1000dvh] relative scrollcontainer">
      <Contents scrollRef={scrollProgress} />
      <div className="fixed top-1/2 -translate-y-1/2 right-3 w-[2px] h-1/2">
        <div
          ref={indicatorRef}
          className="w-full bg-yellow-600"
          style={{
            height: "0%",
          }}
        />
      </div>
    </div>
  );
};

export default MobileUI;
