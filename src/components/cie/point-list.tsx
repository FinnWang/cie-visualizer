"use client";

import type { CIEPoint } from "@/lib/cie-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, List } from "lucide-react";

interface PointListProps {
  points: CIEPoint[];
  onDeletePoint: (id: string) => void;
  labelHoriz: string;
  labelVert: string;
}

export function PointList({ points, onDeletePoint, labelHoriz, labelVert }: PointListProps) {
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
            {points.map((point) => (
              <li
                key={point.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-md shadow-sm"
              >
                <div>
                  <p className="font-semibold text-secondary-foreground">{point.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {labelHoriz}: {point.uPrime.toFixed(4)}, {labelVert}: {point.vPrime.toFixed(4)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeletePoint(point.id)}
                  aria-label={`刪除點位 ${point.name}`}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
