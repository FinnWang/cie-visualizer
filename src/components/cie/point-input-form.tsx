
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Save, X, Pencil } from "lucide-react";

const createPointSchema = (labelHoriz: string, labelVert: string) => z.object({
  name: z.string().min(1, { message: "點位名稱為必填項。" }),
  uPrime: z.coerce.number({ invalid_type_error: `${labelHoriz}必須是數字。` }),
  vPrime: z.coerce.number({ invalid_type_error: `${labelVert}必須是數字。` }),
});

type PointFormData = z.infer<ReturnType<typeof createPointSchema>>;

interface PointInputFormProps {
  onSubmit: (data: PointFormData) => void;
  labelHoriz: string;
  labelVert: string;
  placeholderHoriz: string;
  placeholderVert: string;
  mode?: "add" | "edit";
  initialValues?: { name: string; uPrime: number; vPrime: number } | null;
  onCancel?: () => void;
}

export function PointInputForm({
  onSubmit,
  labelHoriz,
  labelVert,
  placeholderHoriz,
  placeholderVert,
  mode = "add",
  initialValues = null,
  onCancel,
}: PointInputFormProps) {
  const pointSchema = createPointSchema(labelHoriz, labelVert);

  const form = useForm<PointFormData>({
    resolver: zodResolver(pointSchema),
    defaultValues: {
      name: "",
      uPrime: undefined,
      vPrime: undefined,
    },
  });

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      form.reset({
        name: initialValues.name,
        uPrime: initialValues.uPrime,
        vPrime: initialValues.vPrime,
      });
    } else if (mode === "add") {
      form.reset({ name: "", uPrime: undefined, vPrime: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialValues?.name, initialValues?.uPrime, initialValues?.vPrime]);

  const handleSubmit = (data: PointFormData) => {
    onSubmit(data);
    if (mode === "add") {
      form.reset({ name: "", uPrime: undefined, vPrime: undefined });
    }
  };

  const isEdit = mode === "edit";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          {isEdit ? <Pencil className="mr-2 h-5 w-5" /> : null}
          {isEdit ? "編輯點位" : "新增點位"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>點位名稱</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：D65" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="uPrime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labelHoriz}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder={placeholderHoriz} {...field} step="0.0001" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vPrime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labelVert}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder={placeholderVert} {...field} step="0.0001" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className={isEdit ? "flex gap-2" : ""}>
              <Button type="submit" className={isEdit ? "flex-1" : "w-full"}>
                {isEdit ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {isEdit ? "更新點位" : "新增點位"}
              </Button>
              {isEdit && onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  <X className="mr-2 h-4 w-4" /> 取消
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
