export type DiagramType = "1976uv" | "1931xy";

export const IMG_WIDTH = 600;
export const IMG_HEIGHT = 600;

export interface DiagramConfig {
  imageSrc: string;
  axisHorizMin: number;
  axisHorizMax: number;
  axisVertMin: number;
  axisVertMax: number;
  diagramOriginXPx: number;
  diagramOriginYPx: number;
  diagramWidthPx: number;
  diagramHeightPx: number;
  buttonText: string;
  titleSuffix: string;
  diagramTitle: string;
  labelHoriz: string;
  labelVert: string;
  labelHorizFull: string;
  labelVertFull: string;
  placeholderHoriz: string;
  placeholderVert: string;
}

const CIE1976: DiagramConfig = {
  imageSrc: "/mceclip5.png",
  axisHorizMin: 0.0,
  axisHorizMax: 0.6,
  axisVertMin: 0.0,
  axisVertMax: 0.6,
  diagramOriginXPx: 38,
  diagramOriginYPx: 566,
  diagramWidthPx: 527,
  diagramHeightPx: 545,
  buttonText: "切換至 CIE 1931 xy 圖表",
  titleSuffix: "u'v' (1976) and x'y' (1931)",
  diagramTitle: "CIE 1976 u'v'",
  labelHoriz: "u'",
  labelVert: "v'",
  labelHorizFull: "u' 座標",
  labelVertFull: "v' 座標",
  placeholderHoriz: "例如：0.1978",
  placeholderVert: "例如：0.4683",
};

const CIE1931: DiagramConfig = {
  imageSrc: "/cie1931_diagram.png",
  axisHorizMin: 0.0,
  axisHorizMax: 0.8,
  axisVertMin: 0.0,
  axisVertMax: 0.9,
  diagramOriginXPx: 72,
  diagramOriginYPx: 542,
  diagramWidthPx: 498,
  diagramHeightPx: 525,
  buttonText: "切換至 CIE 1976 u'v' 圖表",
  titleSuffix: "xy (1931)",
  diagramTitle: "CIE 1931 xy",
  labelHoriz: "x",
  labelVert: "y",
  labelHorizFull: "x 座標",
  labelVertFull: "y 座標",
  placeholderHoriz: "例如：0.3127",
  placeholderVert: "例如：0.3290",
};

export function getDiagramConfig(type: DiagramType): DiagramConfig {
  return type === "1976uv" ? CIE1976 : CIE1931;
}
