// client/src/components/TracingBeam.tsx
import { useEffect, useRef, useState } from "react";

interface TracingBeamProps {
  children: React.ReactNode;
  className?: string;
}

export const TracingBeam: React.FC<TracingBeamProps> = ({ children, className = "" }) => {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setSvgHeight(contentRef.current.offsetHeight);
    }

    const handleResize = () => {
      if (contentRef.current) {
        setSvgHeight(contentRef.current.offsetHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    const observer = new MutationObserver(handleResize);
    if (contentRef.current) {
        observer.observe(contentRef.current, { childList: true, subtree: true });
    }

    return () => {
        window.removeEventListener("resize", handleResize);
        observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={`relative mx-auto h-full w-full ${className}`}>
      <div className="absolute -left-4 top-3 md:-left-12">
        <svg
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
          height={svgHeight}
          className="ml-4 block"
          aria-hidden="true"
        >
          <path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="hsl(var(--border))"
            strokeOpacity="0.2"
          ></path>
          <path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            className="motion-reduce:hidden"
          ></path>
          <defs>
            <linearGradient
              id="gradient"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1="0"
              y2={svgHeight}
            >
              <stop stopColor="hsl(var(--primary))" stopOpacity="0"></stop>
              <stop stopColor="hsl(var(--primary))"></stop>
              <stop offset="0.325" stopColor="hsl(var(--primary))"></stop>
              <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentRef}>{children}</div>
    </div>
  );
};