"use client";

import type { CIEPoint } from "@/lib/cie-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, List, Pencil } from "lucide-react";

interface PointListProps {
  points: CIEPoint[];
  onDeletePoint: (id: string) => void;
  onEditPoint?: (id: string) => void;
  editingPointId?: string | null;
  labelHoriz: string;
  labelVert: string;
}

export function PointList({
  points,
  onDeletePoint,
  onEditPoint,
  editingPointId,
  labelHoriz,
  labelVert,
}: PointListProps) {
  if (points.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <List className="mr-2 h-5 w-5" />
            已標記點位
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">尚未標記任何點位。</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <List className="mr-2 h-5 w-5" />
          已標記點位 ({points.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <ul className="space-y-3">
            {points.map((point) => {
              const isEditing = editingPointId === point.id;
              return (
                <li
                  key={point.id}
                  className={`flex items-center justify-between p-3 rounded-md shadow-sm ${
                    isEditing ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary/50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-secondary-foreground truncate">{point.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {labelHoriz}: {point.uPrime.toFixed(4)}, {labelVert}: {point.vPrime.toFixed(4)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {onEditPoint && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditPoint(point.id)}
                        aria-label={`編輯點位 ${point.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeletePoint(point.id)}
                      aria-label={`刪除點位 ${point.name}`}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
