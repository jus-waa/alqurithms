// lines for cnot and toffoli
import { useEffect, useRef, useState } from "react"

interface MultiSlotMeta {
  control: number;
  control2?: number;
  control3?: number;
  target: number;
  measurement?: number;
}

interface CircuitOverlayProps {
  multiSlots: Record<string, MultiSlotMeta>;
  gateRefs: Record<string, HTMLDivElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  lineRefs: Record<string, HTMLDivElement | null>;
  qubitCount: number;
}

interface ConnectorLine {
  x: number;
  y1: number;
  y2: number;
  passThroughYs?: number[];
  isDoubleLine?: boolean;
}

export default function CircuitOverlay({ multiSlots, gateRefs, containerRef, lineRefs, qubitCount}: CircuitOverlayProps) {
  const [lines, setLines] = useState<ConnectorLine[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    // get container pos
    const container = containerRef.current;
    //console.log("containerRef", container);
    const containerRect = container.getBoundingClientRect();
    //console.log("container pos and size", containerRect);
    // mathch size to container
    setSize({ w: containerRect.width, h: containerRect.height });

    const computedLines: ConnectorLine[] = [];
    for (const [instanceId, meta] of Object.entries(multiSlots)) {
      //console.log(instanceId, meta);
      const gateType = instanceId.split("-")[0];

      if (gateType == "CNOT") {
        const controlElement = gateRefs[`${instanceId}-${meta.control}`];
        const targetElement = gateRefs[`${instanceId}-${meta.target}`];
        // console.log("control", controlElement);
        if (!controlElement || !targetElement) continue;

        // pos and size of where container is and where control and target gat eis 
        const cRect = controlElement.getBoundingClientRect();
        const tRect = targetElement.getBoundingClientRect();

        const x = cRect.left - containerRect.left + cRect.width / 2;
        const y1 = cRect.top - containerRect.top + cRect.height / 2;
        const y2 = tRect.top - containerRect.top + tRect.height / 2;

        computedLines.push({ x, y1, y2 });

      } else if (gateType === "T") {
        const controlElement = gateRefs[`${instanceId}-${meta.control}`];
        const targetElement = gateRefs[`${instanceId}-${meta.target}`];
        if (!controlElement || !targetElement) continue;

        const cRect = controlElement.getBoundingClientRect();
        const tRect = targetElement.getBoundingClientRect();

        const x = cRect.left - containerRect.left + cRect.width / 2;
        const y1 = cRect.top - containerRect.top + cRect.height / 2;
        const y2 = tRect.top - containerRect.top + tRect.height / 2;
        const passThroughYs: number[] = [];
        for (const key of ["control2", "control3"] as const) {
          const i = meta[key];
          if (i === undefined) {
            continue;
          }

          const element = gateRefs[`${instanceId}-${i}`];
          if (!element) {
            continue;
          }
          const pos = element.getBoundingClientRect();
          passThroughYs.push(pos.top - containerRect.top + pos.height / 2);
        }
        computedLines.push({ x, y1, y2, passThroughYs });
      } else if (gateType === "M") {
        const measurementElement = gateRefs[`${instanceId}`];
        if (!measurementElement) continue;
        const lastLineElement = lineRefs[`line-${qubitCount - 1}`];
        if (!lastLineElement) continue;
        const lastRect = lastLineElement.getBoundingClientRect();
        const mRect = measurementElement.getBoundingClientRect();
        const x = mRect.left - containerRect.left + mRect.width / 2;
        const y1 = mRect.top - containerRect.top + mRect.height / 2;
        const y2 = lastRect.top - containerRect.top + lastRect.height / 2;
        const isDoubleLine = true;
        computedLines.push({ x, y1, y2, isDoubleLine });
      }
    }
    setLines(computedLines);
  }, [multiSlots, gateRefs, containerRef, lineRefs, qubitCount]);
  // if no lines dont render
  if (lines.length === 0) return null
  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: size.w,
        height: size.h,
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 5,
      }}
    >
      {lines.map((line, i) => (
        line.isDoubleLine ? (
          <>
            <line
              key={`${i}-a`}
              x1={line.x - 3}
              y1={line.y1}
              x2={line.x - 3}
              y2={line.y2}
              stroke="black"
              strokeWidth={1.5}
              opacity={0.8}
            />
            <line
              key={i}
              x1={line.x + 3}
              y1={line.y1}
              x2={line.x + 3}
              y2={line.y2}
              stroke="black"
              strokeWidth={1.5}
              opacity={0.8}
            />
          </>
        ) : (
          <line
            key={i}
            x1={line.x}
            y1={line.y1}
            x2={line.x}
            y2={line.y2}
            stroke="black"
            strokeWidth={1.5}
            opacity={0.8}
          />
        )
      ))}
    </svg>
  )
}