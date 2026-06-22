import type { CIEPoint } from "./cie-types";
import type { DiagramConfig } from "./cie-constants";
import { IMG_WIDTH, IMG_HEIGHT } from "./cie-constants";
import { clampToImage, transformCoordinates } from "./cie-coords";

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export interface ExportPngOptions {
  scale?: number;
}

export async function exportDiagramAsPng(
  config: DiagramConfig,
  points: CIEPoint[],
  options: ExportPngOptions = {}
): Promise<void> {
  const scale = options.scale ?? 2;
  const canvas = document.createElement("canvas");
  canvas.width = IMG_WIDTH * scale;
  canvas.height = IMG_HEIGHT * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("無法建立 Canvas 繪圖環境。");
  }
  ctx.scale(scale, scale);

  const bg = await loadImage(config.imageSrc);
  ctx.drawImage(bg, 0, 0, IMG_WIDTH, IMG_HEIGHT);

  const transformParams = {
    axisHorizMin: config.axisHorizMin,
    axisHorizMax: config.axisHorizMax,
    axisVertMin: config.axisVertMin,
    axisVertMax: config.axisVertMax,
    diagramOriginXPx: config.diagramOriginXPx,
    diagramOriginYPx: config.diagramOriginYPx,
    diagramWidthPx: config.diagramWidthPx,
    diagramHeightPx: config.diagramHeightPx,
  };

  const markerRadius = 8;
  ctx.lineWidth = 2;
  ctx.font = "bold 14px system-ui, -apple-system, 'Segoe UI', sans-serif";
  ctx.textBaseline = "middle";

  for (const point of points) {
    const { x, y } = transformCoordinates(point.uPrime, point.vPrime, transformParams);
    const { x: cx, y: cy } = clampToImage(x, y, IMG_WIDTH, IMG_HEIGHT, markerRadius);

    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - markerRadius, cy);
    ctx.lineTo(cx + markerRadius, cy);
    ctx.moveTo(cx, cy - markerRadius);
    ctx.lineTo(cx, cy + markerRadius);
    ctx.stroke();

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - markerRadius, cy);
    ctx.lineTo(cx + markerRadius, cy);
    ctx.moveTo(cx, cy - markerRadius);
    ctx.lineTo(cx, cy + markerRadius);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();

    const label = point.name;
    const labelX = cx + markerRadius + 4;
    const labelY = cy;
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.strokeText(label, labelX, labelY);
    ctx.fillStyle = "#111";
    ctx.fillText(label, labelX, labelY);
  }

  ctx.font = "bold 16px system-ui, -apple-system, 'Segoe UI', sans-serif";
  ctx.textBaseline = "alphabetic";
  const titleX = 12;
  const titleY = IMG_HEIGHT - 12;
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.strokeText(config.diagramTitle, titleX, titleY);
  ctx.fillStyle = "#111";
  ctx.fillText(config.diagramTitle, titleX, titleY);

  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas 轉換 PNG 失敗。"));
        return;
      }
      const tag = config.diagramTitle.replace(/\s+/g, "_").replace(/['"]/g, "");
      triggerDownload(blob, `cie_${tag}_${timestamp()}.png`);
      resolve();
    }, "image/png");
  });
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportPointsAsCsv(
  points: CIEPoint[],
  labelHoriz: string,
  labelVert: string
): void {
  const header = ["Name", labelHoriz, labelVert].map(escapeCsvCell).join(",");
  const rows = points.map((p) =>
    [p.name, p.uPrime.toFixed(4), p.vPrime.toFixed(4)].map(escapeCsvCell).join(",")
  );
  const csv = "﻿" + [header, ...rows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, `cie_points_${timestamp()}.csv`);
}
