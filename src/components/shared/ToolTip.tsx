import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ReactNode, useRef, useState } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  background?: string;
  color?: string;
}

export const ToolTip = ({
  children,
  content,
  position = "top",
  background = "rgba(30, 30, 30, 0.9)",
  color = "#f5f5f5",
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!tooltipRef.current) return;

    if (isVisible) {
      // Initial state
      gsap.set(tooltipRef.current, {
        opacity: 0,
        scale: 0.8,
        y: position === "top" ? 10 : position === "bottom" ? -10 : 0,
        x: position === "left" ? 10 : position === "right" ? -10 : 0,
      });

      // Animate in
      gsap.to(tooltipRef.current, {
        opacity: 1,
        scale: 1,
        y: position === "top" ? 0 : position === "bottom" ? 0 : 0,
        x: position === "left" ? 0 : position === "right" ? 0 : 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isVisible, position]);

  const getPositionStyles = () => {
    switch (position) {
      case "top":
        return {
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginBottom: "8px",
        };
      case "bottom":
        return {
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginTop: "8px",
        };
      case "left":
        return {
          right: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          marginRight: "8px",
        };
      case "right":
        return {
          left: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          marginLeft: "8px",
        };
      default:
        return {
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginBottom: "8px",
        };
    }
  };

  const getArrowStyles = () => {
    switch (position) {
      case "top":
        return {
          bottom: "-4px",
          left: "50%",
          transform: "translateX(-50%)",
        };
      case "bottom":
        return {
          top: "-4px",
          left: "50%",
          transform: "translateX(-50%)",
        };
      case "left":
        return {
          right: "-4px",
          top: "50%",
          transform: "translateY(-50%)",
        };
      case "right":
        return {
          left: "-4px",
          top: "50%",
          transform: "translateY(-50%)",
        };
      default:
        return {
          bottom: "-4px",
          left: "50%",
          transform: "translateX(-50%)",
        };
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-[9999] px-2 py-1 text-sm border-[1px] border-gray-600 rounded-md whitespace-nowrap pointer-events-none"
          style={{
            ...getPositionStyles(),
            background,
            color,
          }}
        >
          {content}
          <div
            className="absolute w-2 h-2"
            style={{
              ...getArrowStyles(),
              background,
            }}
          />
        </div>
      )}
    </div>
  );
};
