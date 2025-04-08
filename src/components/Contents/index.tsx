import AboutSection from "./AboutSection";
import HeroSection from "./HeroSection";

const Contents = ({ scrollRef }: { scrollRef: React.RefObject<number> }) => {
  return (
    <div className="w-full z-[9999] fixed flex flex-col items-center pointer-events-none ">
      <HeroSection />
      <AboutSection />
    </div>
  );
};

export default Contents;
