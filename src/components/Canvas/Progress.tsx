import { useGSAP } from "@gsap/react";
import { useProgress } from "@react-three/drei";
import gsap from "gsap";
export function Progress({
  setLoadingAssets,
}: {
  setLoadingAssets: (v: boolean) => void;
}) {
  const { active, progress, errors } = useProgress();

  useGSAP(() => {
    if (!active && progress === 100) {
      setLoadingAssets(true);
      const container = gsap.utils.toArray(".container") as HTMLElement[];
      gsap.to(container[0], {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
          container[0].style.display = "none";
        },
      });
    }
  }, [active]);

  return (
    <div
      className={`flex bg-transparent p-3 md:p-6 flex-col h-[100vh] mx-auto w-full justify-center items-center rounded-md text-sm z-[2000] container`}
    >
      {/* <div>Current: {item}</div>
          <div>Loaded: {loaded}</div>
          <div>Total: {total}</div> */}
      <div className="w-full mb-4 max-w-full md:max-w-4/ border border-[#8BC34A] h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-50 min-w-1"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
      <div>{progress.toFixed(2)}% Loaded</div>
      {errors.length > 0 && (
        <div className="text-red-500">
          Errors: {errors.length}
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
