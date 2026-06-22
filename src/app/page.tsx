
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CIEPoint, ExternalCIEPoint } from "@/lib/cie-types";
import { CIEDiagram } from "@/components/cie/cie-diagram";
import { PointInputForm } from "@/components/cie/point-input-form";
import { PointList } from "@/components/cie/point-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  FileDown,
  FileSpreadsheet,
  FileUp,
  ImageDown,
  RotateCcw,
  Share2,
  StretchHorizontal,
  Trash2,
} from "lucide-react";
import {
  IMG_HEIGHT,
  IMG_WIDTH,
  getDiagramConfig,
  type DiagramType,
} from "@/lib/cie-constants";
import { exportDiagramAsPng, exportPointsAsCsv } from "@/lib/export-utils";
import {
  buildShareUrl,
  readSharedStateFromUrl,
  URL_MAX_LENGTH,
} from "@/lib/url-state";

const STORAGE_KEY = "cie-visualizer-state-v1";

interface StoredState {
  points: ExternalCIEPoint[];
  diagramType: DiagramType;
}

function makePointId(prefix = "point"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function hydratePoints(external: ExternalCIEPoint[], prefix = "point"): CIEPoint[] {
  return external.map((p, i) => ({
    id: `${prefix}-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 9)}`,
    name: p.name,
    uPrime: p.uPrime,
    vPrime: p.vPrime,
  }));
}

export default function CIEVisualizerPage() {
  const [points, setPoints] = useState<CIEPoint[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [diagramType, setDiagramType] = useState<DiagramType>("1931xy");
  const [editingPointId, setEditingPointId] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);

    const shared = readSharedStateFromUrl();
    if (shared) {
      setPoints(hydratePoints(shared.points, "shared"));
      setDiagramType(shared.diagramType);
      toast({
        title: "已從分享連結載入",
        description: `匯入 ${shared.points.length} 個點位。`,
      });
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredState;
        if (parsed && Array.isArray(parsed.points)) {
          setPoints(hydratePoints(parsed.points, "stored"));
        }
        if (parsed.diagramType === "1976uv" || parsed.diagramType === "1931xy") {
          setDiagramType(parsed.diagramType);
        }
      }
    } catch (err) {
      console.warn("Failed to read stored state:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isClient) return;
    try {
      const toStore: StoredState = {
        points: points.map(({ name, uPrime, vPrime }) => ({ name, uPrime, vPrime })),
        diagramType,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (err) {
      console.warn("Failed to write stored state:", err);
    }
  }, [points, diagramType, isClient]);

  const diagramConfig = useMemo(() => getDiagramConfig(diagramType), [diagramType]);

  const editingPoint = useMemo(
    () => (editingPointId ? points.find((p) => p.id === editingPointId) ?? null : null),
    [editingPointId, points]
  );

  const handleAddPoint = (data: { name: string; uPrime: number; vPrime: number }) => {
    if (editingPointId) {
      setPoints((prev) =>
        prev.map((p) => (p.id === editingPointId ? { ...p, ...data } : p))
      );
      toast({
        title: "點位已更新",
        description: `點位 "${data.name}" 已更新。`,
      });
      setEditingPointId(null);
      return;
    }
    const newPoint: CIEPoint = { id: makePointId(), ...data };
    setPoints((prev) => [...prev, newPoint]);
    toast({
      title: "點位已新增",
      description: `已成功新增點位 "${data.name}"。`,
    });
  };

  const handleClearPoints = () => {
    setPoints([]);
    setEditingPointId(null);
    toast({
      title: "點位已清除",
      description: "所有標記的點位已被清除。",
    });
  };

  const handleDeletePoint = (id: string) => {
    const pointToDelete = points.find((p) => p.id === id);
    setPoints((prev) => prev.filter((p) => p.id !== id));
    if (editingPointId === id) {
      setEditingPointId(null);
    }
    if (pointToDelete) {
      toast({
        title: "點位已刪除",
        description: `點位 "${pointToDelete.name}" 已被刪除。`,
        variant: "destructive",
      });
    }
  };

  const handleEditPoint = (id: string) => {
    setEditingPointId((current) => (current === id ? null : id));
  };

  const handleCancelEdit = () => setEditingPointId(null);

  const handleToggleDiagram = () => {
    setEditingPointId(null);
    setDiagramType((prev) => (prev === "1976uv" ? "1931xy" : "1976uv"));
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
    if (!file) return;

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
            id: `imported-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
            name: p.name,
            uPrime: p.uPrime,
            vPrime: p.vPrime,
          };
        });
        setPoints(newPoints);
        setEditingPointId(null);
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
  };

  const handleExportPng = useCallback(async () => {
    if (!isClient) return;
    if (points.length === 0) {
      toast({
        title: "無法匯出",
        description: "沒有可匯出的點位。",
        variant: "destructive",
      });
      return;
    }
    try {
      await exportDiagramAsPng(diagramConfig, points);
      toast({
        title: "PNG 匯出成功",
        description: "圖表已儲存為 PNG 圖片。",
      });
    } catch (err: any) {
      console.error("PNG export failed:", err);
      toast({
        title: "PNG 匯出失敗",
        description: err?.message ?? "未知錯誤。",
        variant: "destructive",
      });
    }
  }, [isClient, points, diagramConfig, toast]);

  const handleExportCsv = () => {
    if (!isClient) return;
    if (points.length === 0) {
      toast({
        title: "無法匯出",
        description: "沒有可匯出的點位。",
        variant: "destructive",
      });
      return;
    }
    exportPointsAsCsv(points, diagramConfig.labelHoriz, diagramConfig.labelVert);
    toast({
      title: "CSV 匯出成功",
      description: "點位資料已匯出為 CSV 檔案。",
    });
  };

  const handleShareLink = async () => {
    if (!isClient) return;
    if (points.length === 0) {
      toast({
        title: "無法產生分享連結",
        description: "目前沒有任何點位。",
        variant: "destructive",
      });
      return;
    }
    const shareUrl = buildShareUrl(points, diagramType);
    if (shareUrl.length > URL_MAX_LENGTH) {
      toast({
        title: "點位過多",
        description: "分享連結過長，請改用 JSON 匯出。",
        variant: "destructive",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "分享連結已複製",
        description: "連結已複製到剪貼簿，可貼到任何地方分享。",
      });
    } catch {
      toast({
        title: "無法自動複製",
        description: shareUrl,
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setPoints([]);
    setEditingPointId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    toast({
      title: "已重設",
      description: "本機儲存與所有點位皆已清除。",
      variant: "destructive",
    });
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
                mode={editingPoint ? "edit" : "add"}
                initialValues={editingPoint}
                onCancel={handleCancelEdit}
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
                    onClick={handleExportPng}
                    className="w-full"
                    disabled={points.length === 0 || !isClient}
                  >
                    <ImageDown className="mr-2 h-4 w-4" /> 匯出為 PNG
                  </Button>
                  <Button
                    onClick={handleExportCsv}
                    className="w-full"
                    variant="outline"
                    disabled={points.length === 0 || !isClient}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> 匯出為 CSV
                  </Button>
                  <Button
                    onClick={handleShareLink}
                    className="w-full"
                    variant="outline"
                    disabled={points.length === 0 || !isClient}
                  >
                    <Share2 className="mr-2 h-4 w-4" /> 複製分享連結
                  </Button>
                  <Button
                    onClick={handleExportJson}
                    className="w-full"
                    variant="outline"
                    disabled={points.length === 0 || !isClient}
                  >
                    <FileDown className="mr-2 h-4 w-4" /> 匯出 JSON
                  </Button>
                  <Button
                    onClick={() => isClient && importInputRef.current?.click()}
                    className="w-full"
                    variant="outline"
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
                  <Button
                    onClick={handleClearPoints}
                    variant="destructive"
                    className="w-full"
                    disabled={points.length === 0 || !isClient}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> 清除所有點位
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    disabled={!isClient}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> 重設（清除本機儲存）
                  </Button>
                </CardContent>
              </Card>
              {isClient && (
                <PointList
                  points={points}
                  onDeletePoint={handleDeletePoint}
                  onEditPoint={handleEditPoint}
                  editingPointId={editingPointId}
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
