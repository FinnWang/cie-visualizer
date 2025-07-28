
"use client";

import { useState, useRef, useEffect } from "react";
import type { CIEPoint, ExternalCIEPoint } from "@/lib/cie-types";
import { CIEDiagram } from "@/components/cie/cie-diagram";
import { PointInputForm } from "@/components/cie/point-input-form";
import { PointList } from "@/components/cie/point-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileDown, FileUp, Trash2, Eye, StretchHorizontal } from "lucide-react";

const IMG_WIDTH = 600;
const IMG_HEIGHT = 600;

// --- CIE 1976 u'v' Diagram Settings ---
// 圖片路徑 (相對於 public 資料夾)
const CIE1976_IMAGE_URL = "/mceclip5.png";
// u'v' 座標軸的數據範圍
const U_PRIME_1976_MIN = 0.0;
const U_PRIME_1976_MAX = 0.6;
const V_PRIME_1976_MIN = 0.0;
const V_PRIME_1976_MAX = 0.6;
// 圖表原點 (u'Min, v'Min) 在圖片上的像素位置 (從圖片左上角算起)
// DIAGRAM1976_ORIGIN_Y_PX 通常是圖表 Y 軸物理顯示上的最低點
// 範例值：假設圖表左下角原點在 (X=50px, Y=550px from top)
const DIAGRAM1976_ORIGIN_X_PX = 38; // 您的 mceclip5.png 圖表中 u'軸最小值所在的 X 像素位置
const DIAGRAM1976_ORIGIN_Y_PX = 566; // 您的 mceclip5.png 圖表中 v'軸最小值所在的 Y 像素位置 (通常是圖表底部)
// 圖表 X 軸與 Y 軸在圖片上所佔的總像素寬度與高度
const DIAGRAM1976_WIDTH_PX = 527;   // 您的 mceclip5.png 圖表中 u'軸的總像素寬度
const DIAGRAM1976_HEIGHT_PX = 545;  // 您的 mceclip5.png 圖表中 v'軸的總像素高度

// --- CIE 1931 xy Diagram Settings ---
const CIE1931_IMAGE_URL = "/cie1931_diagram.png";
// xy 座標軸的數據範圍
const X_1931_MIN = 0.0;
const X_1931_MAX = 0.8;
const Y_1931_MIN = 0.0;
const Y_1931_MAX = 0.9;
// 圖表原點 (xMin, yMin) 在圖片上的像素位置
const DIAGRAM1931_ORIGIN_X_PX = 72; // 您的 cie1931_diagram.png 圖表中 x軸最小值所在的 X 像素位置
const DIAGRAM1931_ORIGIN_Y_PX = 542; // 您的 cie1931_diagram.png 圖表中 y軸最小值所在的 Y 像素位置 (通常是圖表底部)
// 圖表 X 軸與 Y 軸在圖片上所佔的總像素寬度與高度
const DIAGRAM1931_WIDTH_PX = 498; // 您的 cie1931_diagram.png 圖表中 x軸的總像素寬度
const DIAGRAM1931_HEIGHT_PX = 525; // 您的 cie1931_diagram.png 圖表中 y軸的總像素高度


export default function CIEVisualizerPage() {
  const [points, setPoints] = useState<CIEPoint[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [diagramType, setDiagramType] = useState<'1976uv' | '1931xy'>('1931xy');
  const importInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddPoint = (data: { name: string; uPrime: number; vPrime: number }) => {
    const newPoint: CIEPoint = {
      id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
    };
    setPoints((prevPoints) => [...prevPoints, newPoint]);
    toast({
      title: "點位已新增",
      description: `已成功新增點位 "${data.name}"。`,
    });
  };

  const handleClearPoints = () => {
    setPoints([]);
    toast({
      title: "點位已清除",
      description: "所有標記的點位已被清除。",
    });
  };

  const handleDeletePoint = (id: string) => {
    const pointToDelete = points.find(p => p.id === id);
    setPoints((prevPoints) => prevPoints.filter((point) => point.id !== id));
    if (pointToDelete) {
      toast({
        title: "點位已刪除",
        description: `點位 "${pointToDelete.name}" 已被刪除。`,
        variant: "destructive",
      });
    }
  };

  const handleExportJson = () => {
    if (!isClient) return;
    if (points.length === 0) {
      toast({
        title: "無法匯出",
        description: "沒有可匯出的點位。",
        variant: "destructive",
      });
      return;
    }
    const exportData: ExternalCIEPoint[] = points.map(({ id, ...rest }) => rest);
    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cie_points.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "匯出成功",
      description: "點位資料已成功匯出為 JSON 檔案。",
    });
  };

  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isClient) return;
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          if (!Array.isArray(importedData)) {
            throw new Error("JSON 檔案格式不正確，應為一個陣列。");
          }
          const newPoints: CIEPoint[] = importedData.map((p: any, index: number) => {
            if (
              typeof p.name !== "string" ||
              typeof p.uPrime !== "number" ||
              typeof p.vPrime !== "number"
            ) {
              throw new Error(`第 ${index + 1} 個點位資料格式不正確。`);
            }
            return {
              id: `imported-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
              name: p.name,
              uPrime: p.uPrime,
              vPrime: p.vPrime,
            };
          });
          setPoints(newPoints);
          toast({
            title: "匯入成功",
            description: `成功匯入 ${newPoints.length} 個點位。`,
          });
        } catch (error: any) {
          console.error("Error importing JSON:", error);
          toast({
            title: "匯入失敗",
            description: error.message || "讀取 JSON 檔案時發生錯誤。",
            variant: "destructive",
          });
        } finally {
          if (importInputRef.current) {
            importInputRef.current.value = "";
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleToggleDiagram = () => {
    setDiagramType(prevType => prevType === '1976uv' ? '1931xy' : '1976uv');
  };

  const diagramConfig = diagramType === '1976uv' ? {
    imageSrc: CIE1976_IMAGE_URL,
    axisHorizMin: U_PRIME_1976_MIN,
    axisHorizMax: U_PRIME_1976_MAX,
    axisVertMin: V_PRIME_1976_MIN,
    axisVertMax: V_PRIME_1976_MAX,
    diagramOriginXPx: DIAGRAM1976_ORIGIN_X_PX,
    diagramOriginYPx: DIAGRAM1976_ORIGIN_Y_PX,
    diagramWidthPx: DIAGRAM1976_WIDTH_PX,
    diagramHeightPx: DIAGRAM1976_HEIGHT_PX,
    buttonText: "切換至 CIE 1931 xy 圖表",
    titleSuffix: "u'v' (1976) and x'y' (1931)",
    labelHoriz: "u'",
    labelVert: "v'",
    labelHorizFull: "u' 座標",
    labelVertFull: "v' 座標",
    placeholderHoriz: "例如：0.1978",
    placeholderVert: "例如：0.4683",
  } : {
    imageSrc: CIE1931_IMAGE_URL,
    axisHorizMin: X_1931_MIN,
    axisHorizMax: X_1931_MAX,
    axisVertMin: Y_1931_MIN,
    axisVertMax: Y_1931_MAX,
    diagramOriginXPx: DIAGRAM1931_ORIGIN_X_PX,
    diagramOriginYPx: DIAGRAM1931_ORIGIN_Y_PX,
    diagramWidthPx: DIAGRAM1931_WIDTH_PX,
    diagramHeightPx: DIAGRAM1931_HEIGHT_PX,
    buttonText: "切換至 CIE 1976 u'v' 圖表",
    titleSuffix: "xy (1931)",
    labelHoriz: "x",
    labelVert: "y",
    labelHorizFull: "x 座標",
    labelVertFull: "y 座標",
    placeholderHoriz: "例如：0.3127",
    placeholderVert: "例如：0.3290",
  };


  return (
    <>
      <div className="min-h-screen flex flex-col">
        <header className="bg-card border-b shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-2xl font-semibold text-foreground">
                CIE Visual <span className="text-base text-muted-foreground">({diagramConfig.titleSuffix})</span>
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <PointInputForm
                onSubmit={handleAddPoint}
                labelHoriz={diagramConfig.labelHorizFull}
                labelVert={diagramConfig.labelVertFull}
                placeholderHoriz={diagramConfig.placeholderHoriz}
                placeholderVert={diagramConfig.placeholderVert}
              />
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">控制面板</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleToggleDiagram}
                    className="w-full"
                    variant="outline"
                    disabled={!isClient}
                  >
                    <StretchHorizontal className="mr-2 h-4 w-4" /> {diagramConfig.buttonText}
                  </Button>
                  <Button
                    onClick={handleClearPoints}
                    variant="destructive"
                    className="w-full"
                    disabled={points.length === 0 || !isClient}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> 清除所有點位
                  </Button>
                  <Button 
                    onClick={handleExportJson} 
                    className="w-full"
                    disabled={points.length === 0 || !isClient}
                  >
                    <FileDown className="mr-2 h-4 w-4" /> 匯出 JSON
                  </Button>
                  <Button
                    onClick={() => isClient && importInputRef.current?.click()}
                    className="w-full"
                    disabled={!isClient}
                  >
                    <FileUp className="mr-2 h-4 w-4" /> 匯入 JSON
                  </Button>
                  <Input
                    type="file"
                    ref={importInputRef}
                    onChange={handleImportJson}
                    accept=".json"
                    className="hidden"
                    disabled={!isClient}
                  />
                </CardContent>
              </Card>
              {isClient && (
                <PointList
                  points={points}
                  onDeletePoint={handleDeletePoint}
                  labelHoriz={diagramConfig.labelHoriz}
                  labelVert={diagramConfig.labelVert}
                />
              )}
            </div>

            <div className="lg:col-span-2 flex justify-center items-start">
              {isClient ? (
                <CIEDiagram
                  points={points}
                  imageSrc={diagramConfig.imageSrc}
                  imageWidth={IMG_WIDTH}
                  imageHeight={IMG_HEIGHT}
                  axisHorizMin={diagramConfig.axisHorizMin}
                  axisHorizMax={diagramConfig.axisHorizMax}
                  axisVertMin={diagramConfig.axisVertMin}
                  axisVertMax={diagramConfig.axisVertMax}
                  diagramOriginXPx={diagramConfig.diagramOriginXPx}
                  diagramOriginYPx={diagramConfig.diagramOriginYPx}
                  diagramWidthPx={diagramConfig.diagramWidthPx}
                  diagramHeightPx={diagramConfig.diagramHeightPx}
                  labelHoriz={diagramConfig.labelHoriz}
                  labelVert={diagramConfig.labelVert}
                />
              ) : (
                <div style={{ width: IMG_WIDTH, height: IMG_HEIGHT }} className="bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">載入中...</p>
                </div>
              )}
            </div>
          </div>
        </main>
        <footer className="text-center p-4 text-sm text-muted-foreground border-t">
           {/* 動態終端機屬名 */}
           <div className="terminal-style mt-4 inline-block font-mono text-xs">
             <span>&gt; Forged by Finn</span>

           </div>

           <style jsx>{`
             .terminal-style span:first-child {
               display: inline-block;
               white-space: nowrap;
               overflow: hidden;
               width: 0;
               animation: typing 2s steps(16, end) forwards;
             }

             .cursor {
               display: inline-block;
               vertical-align: bottom;
               animation: blink 1s step-end infinite;
             }

             @keyframes typing {
               from { width: 0 }
               to { width: 100% }
             }

             @keyframes blink {
               from, to { opacity: 1 }
               50% { opacity: 0 }
             }
           `}</style>
           <p>&copy; {new Date().getFullYear()} CIE Visualizer. All Rights Reserved.</p>
        </footer>
            


      </div>
    </>
  );
}
    
    
