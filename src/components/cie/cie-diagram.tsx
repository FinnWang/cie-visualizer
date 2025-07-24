
"use client";

import type { CIEPoint } from "@/lib/cie-types";
import Image from "next/image";
import { Crosshair } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CIEDiagramProps {
  points: CIEPoint[];
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
  axisHorizMin: number;
  axisHorizMax: number;
  axisVertMin: number;
  axisVertMax: number;
  diagramOriginXPx: number;
  diagramOriginYPx: number;
  diagramWidthPx: number;
  diagramHeightPx: number;
  labelHoriz: string;
  labelVert: string;
}

export function CIEDiagram({
  points,
  imageSrc,
  imageWidth,
  imageHeight,
  axisHorizMin,
  axisHorizMax,
  axisVertMin,
  axisVertMax,
  diagramOriginXPx,
  diagramOriginYPx,
  diagramWidthPx,
  diagramHeightPx,
  labelHoriz,
  labelVert,
}: CIEDiagramProps) {
  const transformCoordinates = (pointU: number, pointV: number) => {
    const horizAxisRange = axisHorizMax - axisHorizMin;
    const vertAxisRange = axisVertMax - axisVertMin;

    if (horizAxisRange <= 0 || vertAxisRange <= 0 || diagramWidthPx <= 0 || diagramHeightPx <= 0) {
      return { x: diagramOriginXPx + diagramWidthPx / 2, y: diagramOriginYPx - diagramHeightPx / 2 };
    }

    const uRatio = (pointU - axisHorizMin) / horizAxisRange;
    const vRatio = (pointV - axisVertMin) / vertAxisRange;

    const xOffsetFromOrigin = uRatio * diagramWidthPx;
    const yOffsetFromOrigin = vRatio * diagramHeightPx;

    const finalX = diagramOriginXPx + xOffsetFromOrigin;
    const finalY = diagramOriginYPx - yOffsetFromOrigin;
    
    return { x: finalX, y: finalY };
  };

  return (
    <TooltipProvider>
      <div
        className="relative rounded-lg shadow-lg overflow-hidden border border-border"
        style={{ width: imageWidth, height: imageHeight }}
        aria-label="CIE Chromaticity Diagram"
      >
        <Image
          src={imageSrc}
          alt="CIE Chromaticity Diagram"
          width={imageWidth}
          height={imageHeight}
          priority
          className="absolute inset-0 object-fill w-full h-full"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            console.error(`Failed to load image: ${target.src}`, e);
          }}
        />
        {points.map((point) => {
          const { x, y } = transformCoordinates(point.uPrime, point.vPrime);
          
          const iconHalfSize = 12; 
          const clampedX = Math.max(iconHalfSize, Math.min(x, imageWidth - iconHalfSize));
          const clampedY = Math.max(iconHalfSize, Math.min(y, imageHeight - iconHalfSize));

          return (
            <Tooltip key={point.id}>
              <TooltipTrigger asChild>
                <div
                  className="absolute transition-all duration-300 ease-out"
                  style={{
                    left: `${clampedX}px`,
                    top: `${clampedY}px`,
                    transform: "translate(-50%, -50%) scale(0)", 
                    animation: "popIn 0.3s ease-out forwards",
                  }}
                  role="img"
                  aria-label={`Point: ${point.name} at (${labelHoriz}: ${point.uPrime.toFixed(4)}, ${labelVert}: ${point.vPrime.toFixed(4)})`}
                >
                  <Crosshair className="w-6 h-6 text-foreground drop-shadow-[0_0_2px_hsl(var(--background))]" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{point.name}</p>
                <p>{labelHoriz}: {point.uPrime.toFixed(4)}</p>
                <p>{labelVert}: {point.vPrime.toFixed(4)}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      <style jsx global>{`
        @keyframes popIn {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          70% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </TooltipProvider>
  );
}
