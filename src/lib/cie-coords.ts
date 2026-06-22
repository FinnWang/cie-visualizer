export interface CoordTransformParams {
  axisHorizMin: number;
  axisHorizMax: number;
  axisVertMin: number;
  axisVertMax: number;
  diagramOriginXPx: number;
  diagramOriginYPx: number;
  diagramWidthPx: number;
  diagramHeightPx: number;
}

export function transformCoordinates(
  pointU: number,
  pointV: number,
  params: CoordTransformParams
): { x: number; y: number } {
  const {
    axisHorizMin,
    axisHorizMax,
    axisVertMin,
    axisVertMax,
    diagramOriginXPx,
    diagramOriginYPx,
    diagramWidthPx,
    diagramHeightPx,
  } = params;

  const horizAxisRange = axisHorizMax - axisHorizMin;
  const vertAxisRange = axisVertMax - axisVertMin;

  if (
    horizAxisRange <= 0 ||
    vertAxisRange <= 0 ||
    diagramWidthPx <= 0 ||
    diagramHeightPx <= 0
  ) {
    return {
      x: diagramOriginXPx + diagramWidthPx / 2,
      y: diagramOriginYPx - diagramHeightPx / 2,
    };
  }

  const uRatio = (pointU - axisHorizMin) / horizAxisRange;
  const vRatio = (pointV - axisVertMin) / vertAxisRange;

  return {
    x: diagramOriginXPx + uRatio * diagramWidthPx,
    y: diagramOriginYPx - vRatio * diagramHeightPx,
  };
}

export function clampToImage(
  x: number,
  y: number,
  imageWidth: number,
  imageHeight: number,
  margin: number
): { x: number; y: number } {
  return {
    x: Math.max(margin, Math.min(x, imageWidth - margin)),
    y: Math.max(margin, Math.min(y, imageHeight - margin)),
  };
}
